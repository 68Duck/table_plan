import csv
from datetime import timedelta
from os import path
import sqlite3
from flask import g,Flask,render_template,request
from flask_mail import Mail, Message
from os import path
import qrcode
from dict_factory import dict_factory
import hashlib
import json

fileDir = path.dirname(__file__) # for loading images

app = Flask(__name__)   #creates the application flask

app.secret_key = "b6jF" #sets secret key for encription i.e. my encription + first words quack

number_of_tables = 20
number_of_seats_per_table = 10

class Table_plan_Login(object):
    def __init__(self):
        self.DATABASE = "table_plan.db"

    def query_db(self,query, args=()):
        cur = self.get_db().execute(query, args)
        cur.row_factory = dict_factory
        rv = cur.fetchall()
        cur.close()
        return rv

    def get_db(self):
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = sqlite3.connect(path.join(fileDir,self.DATABASE))
        return db

    def send_login_email(self,email_record):
        forename = email_record["forename"]
        surname = email_record["surname"]
        email_address = email_record["email"]
        table_link = self.get_table_link(email_address)
        # print(forename,surname,email_address)
        app.config['MAIL_SERVER']='smtp.gmail.com'
        app.config['MAIL_PORT'] = 465
        app.config['MAIL_USE_TLS'] = False
        app.config['MAIL_USE_SSL'] = True
        app.config["MAIL_USERNAME"] = "test68duck@gmail.com"
        app.config["MAIL_PASSWORD"] = "password123@"
        subject = "Table Plan Link"
        message = "Hello {0} {1},\n\nThank you for logging into the table plan. Here is your link to the table plan:\n{2}\nPlease don't share this with anyone else since this link is unique to you and any changes made will be associated with this email, so any malicious behaviour will be able to be tracked to this email.\n\nIf you have any issues with this system or the table plan in general, don't hesitate to contact me on HenryJP@rgshw.com.\n\nRegards,\nJosh Henry".format(forename,surname,table_link)
        mail = Mail(app)
        msg = Message(subject,sender="test68duck@gmail.com",recipients = [email_address])
        msg.body = message
        mail.send(msg)
        #the message was changed to above since below did not work with the raspberry pi.
        # message = f"""
        # Hello {forename} {surname},
        #
        # Thank you for logging into the table plan. Here is your link to the table plan:
        # {table_link}
        # Please don't share this with anyone else since this link is unique to you and any changes made will be associated with this email, so any malicious behaviour will be able to be tracked to this email.
        #
        # If you have any issues with this system or the table plan in general, don't hesitate to contact me on HenryJP@rgshw.com.
        #
        # Regards,
        # Josh Henry
        # """

    def get_table_link(self,email_address):
        m = hashlib.sha256()
        m.update(email_address.encode("utf8"))
        hash = m.hexdigest()
        link = "http://68duck.co.uk/table_plan/" + hash
        return link

class Table_plan(object):
    def __init__(self):
        self.DATABASE = "table_plan.db"

    def query_db(self,query, args=()):
        cur = self.get_db().execute(query, args)
        cur.row_factory = dict_factory
        rv = cur.fetchall()
        cur.close()
        return rv

    def get_db(self):
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = sqlite3.connect(path.join(fileDir,self.DATABASE),isolation_level = None)
        return db

    def get_hash(self,email_address):
        m = hashlib.sha256()
        m.update(email_address.encode("utf8"))
        hash = m.hexdigest()
        return hash

    def insert_into_table(self,table_name,record_values):
        question_marks = ""
        for i in range(len(record_values)):
            question_marks = question_marks + "?,"
        question_marks = question_marks[0:len(question_marks)-1]
        query = "INSERT INTO {0} VALUES ({1})".format(table_name,question_marks)
        self.query_db(query,record_values)

@app.route("/table_plan/admin/<id>")
def table_plan_admin(id):
    table_plan = Table_plan()
    table_names = ["Guests","RGS_students","people_in_tables","student_guest_link"]
    if id == "ba01338ba5fa0c1584a6d41f93fe550b1d715a8de2da10d6c673131a85658394":
        return render_template("table_plan_admin.html",table_names=table_names)
    else:
        return render_template("table_plan_error_page.html")

@app.route("/table_plan_admin_open_table",methods=["POST"])
def admin_open_table():
    data = request.get_json()
    if data is None:
        return "No data recieved"
    else:
        table_name = data
        table_plan = Table_plan()
        table_information = table_plan.query_db("SELECT * FROM {0}".format(table_name,))
        table_information = [list(dict.values()) for dict in table_information]
        headings_info = table_plan.query_db("PRAGMA table_info({0})".format(table_name,))
        table_information.insert(0,[header["name"] for header in headings_info])
        return json.dumps(table_information)

@app.route("/table_plan_admin_update_table",methods=["POST"])
def admin_update_table():
    data = request.get_json()
    if data is None:
        return "No data recieved"
    else:
        table_name = data.pop()
        table_data = data
        table_plan = Table_plan()
        table_plan.query_db("BEGIN")
        table_plan.query_db("DELETE FROM {0}".format(table_name))
        for val in table_data:
            table_plan.insert_into_table(table_name,val)
        table_plan.query_db("COMMIT")

        return json.dumps("nothing")


@app.route("/table_plan_logon")
def table_plan_logon():
    return render_template("table_plan_logon.html")

@app.route("/table_plan/<id>")
def table_plan(id):
    table_plan = Table_plan()
    record = None
    results = table_plan.query_db("SELECT forename,surname,email,student_id FROM RGS_students")
    for result in results:
        if table_plan.get_hash(result["email"]) == id:
            record = result
            student_id = result["student_id"]
    if record is None:
        return render_template("table_plan_error_page.html")
    else:
        database_table_information = table_plan.query_db("SELECT table_number,student_id,guest_id,seat_number,modified_by_id FROM people_in_tables")
        table_data = []
        changeable_array = []
        for i in range(number_of_tables):
            row = []
            for j in range(number_of_seats_per_table):
                row.append(None)
            table_data.append(row[:])
            changeable_array.append(row[:])
        for val in database_table_information:
            if val["student_id"] is not None:
                student = table_plan.query_db("SELECT forename,surname,email FROM RGS_students WHERE student_id = ?",(val["student_id"],))[0]
                table_data[val["table_number"]-1][val["seat_number"]-1] = [val["seat_number"],student["forename"],student["surname"]]
                if student_id == val["modified_by_id"] or student_id == val["student_id"]:
                    changeable_array[val["table_number"]-1][val["seat_number"]-1] = True
                else:
                    changeable_array[val["table_number"]-1][val["seat_number"]-1] = False
            elif val["guest_id"] is not None:
                guest = table_plan.query_db("SELECT forename,surname FROM Guests WHERE guest_id = ?",(val["guest_id"],))[0]
                table_data[val["table_number"]-1][val["seat_number"]-1] = [val["seat_number"],guest["forename"],guest["surname"]]
                if student_id == val["modified_by_id"]:
                    changeable_array[val["table_number"]-1][val["seat_number"]-1] = True
                else:
                    changeable_array[val["table_number"]-1][val["seat_number"]-1] = False
            else:
                pass
        # print(changeable_array)
        # print(table_data)
        forenames = []
        surnames = []
        names = []
        records = table_plan.query_db("SELECT forename,surname FROM RGS_students")
        for r in records:
            forenames.append(r["forename"])
            surnames.append(r["surname"])
            names.append([r["forename"],r["surname"]])
        records = table_plan.query_db("SELECT forename,surname FROM Guests")
        for r in records:
            forenames.append(r["forename"])
            surnames.append(r["surname"])
            names.append([r["forename"],r["surname"]])
        fnames = []
        for i in forenames:
            if i not in fnames:
                fnames.append(i)
        snames = []
        for i in surnames:
            if i not in snames:
                snames.append(i)
        # surnames = set(surnames)
        return render_template("table_plan.html",forename=record["forename"],surname=record["surname"],email=record["email"],table_data=table_data,no_tables=len(table_data),changeable_array=changeable_array,names=names,forenames=fnames,surnames=snames)

@app.route("/table_plan_login_email",methods=["POST"])
def send_login_email():
    data = request.get_json()
    if data is None:
        return "There was no email input"
    else:
        table_plan = Table_plan_Login()
        email = data
        email_record = table_plan.query_db("SELECT forename,surname,email FROM RGS_students WHERE email = ? COLLATE NOCASE",(email,))
        if len(email_record) == 0:
            return "There is no student with that email address. Please try again"
        elif len(email_record) > 1:
            return "There are multiple records with the same email. This should not reach this point so please contact Josh that his happened."
        else:
            table_plan.send_login_email(email_record[0])
            return "Email sent"

@app.route("/table_plan_find_changes",methods=["POST"])
def find_changes():
    data = request.get_json()
    if data is None:
        return "No data was sent"
    else:
        try:
            a = data[0][0][0]
        except:
            return "Data is not in the correct format"
        for i,table in enumerate(data):
            for j,val in enumerate(table):
                if val[1] == "" and val[2] == "":
                    data[i][j] = None
            data[i].pop(0)
        table_plan = Table_plan()
        database_table_information = table_plan.query_db("SELECT table_number,student_id,guest_id,seat_number FROM people_in_tables")
        table_data = []
        for i in range(number_of_tables):
            row = []
            for j in range(number_of_seats_per_table):
                row.append(None)
            table_data.append(row)
        for val in database_table_information:
            if val["student_id"] is not None:
                student = table_plan.query_db("SELECT forename,surname,email FROM RGS_students WHERE student_id = ? COLLATE NOCASE",(val["student_id"],))[0]
                table_data[val["table_number"]-1][val["seat_number"]-1] = [str(val["seat_number"]),student["forename"],student["surname"]]
            elif val["guest_id"] is not None:
                guest = table_plan.query_db("SELECT forename,surname FROM Guests WHERE guest_id = ? COLLATE NOCASE",(val["guest_id"],))[0]
                table_data[val["table_number"]-1][val["seat_number"]-1] = [str(val["seat_number"]),guest["forename"],guest["surname"]]
            else:
                pass

        changes = []
        for a in range(len(data)):
            for b in range(len(data[a])):
                if data[a][b] is None and data[a][b] != table_data[a][b]:
                    changes.append([None,None,a+1,b+1])
                elif data[a][b] != table_data[a][b]:
                    changes.append([data[a][b][1],data[a][b][2],a+1,b+1])

        # print(changes)
        return json.dumps(changes)

@app.route("/table_plan_confirm_changes",methods=["POST"])
def confirm_changes():
    data = request.get_json()
    if data is None:
        return "No data was sent"
    else:
        table_plan = Table_plan()
        forename = data["forename"]
        surname = data["surname"]
        modifying_student_id_dict = table_plan.query_db("SELECT student_id FROM RGS_students WHERE forename = ? AND surname = ? COLLATE NOCASE",(forename,surname))
        if len(modifying_student_id_dict) == 0:
            return "Modifing student could not be found"
        else:
            modifying_student_id = modifying_student_id_dict[0]["student_id"]
        data = data["table_data"]
        try:
            a = data[0][0][0]
        except:
            return "Data is not in the correct format"
        for i,table in enumerate(data):
            for j,val in enumerate(table):
                if val[1] == "" and val[2] == "":
                    data[i][j] = None
            # data[i].remove(['Seat Number', 'Forename', 'Surname'])
            data[i].pop(0)
        database_table_information = table_plan.query_db("SELECT table_number,student_id,guest_id,seat_number FROM people_in_tables")
        table_data = []
        for i in range(number_of_tables):
            row = []
            for j in range(number_of_seats_per_table):
                row.append(None)
            table_data.append(row)
        for val in database_table_information:
            if val["student_id"] is not None:
                student = table_plan.query_db("SELECT forename,surname,email FROM RGS_students WHERE student_id = ? COLLATE NOCASE",(val["student_id"],))[0]
                table_data[val["table_number"]-1][val["seat_number"]-1] = [str(val["seat_number"]),student["forename"],student["surname"]]
            elif val["guest_id"] is not None:
                guest = table_plan.query_db("SELECT forename,surname FROM Guests WHERE guest_id = ? COLLATE NOCASE",(val["guest_id"],))[0]
                table_data[val["table_number"]-1][val["seat_number"]-1] = [str(val["seat_number"]),guest["forename"],guest["surname"]]
            else:
                pass

        changes = []
        for a in range(len(data)):
            for b in range(len(data[a])):
                if data[a][b] is None and data[a][b] != table_data[a][b]:
                    changes.append([None,None,a+1,b+1])
                elif data[a][b] != table_data[a][b]:
                    changes.append([data[a][b][1],data[a][b][2],a+1,b+1])

        if len(changes) == 0:
            return "No changes were made"

        table_plan.query_db("BEGIN")
        for val in changes:
            if val[0] == None and val[1] == None:
                guests_on_table = table_plan.query_db("SELECT guest_id FROM people_in_tables WHERE table_number = ? COLLATE NOCASE",(val[2],))
                student_id = table_plan.query_db("SELECT student_id FROM people_in_tables WHERE table_number = ? and seat_number = ? COLLATE NOCASE",(val[2],val[3]))
                if len(student_id) == 0:
                    pass
                else:
                    student_id = student_id[0]["student_id"]
                    guests_with_student = table_plan.query_db("SELECT guest_id FROM student_guest_link WHERE student_id = ? COLLATE NOCASE" ,(student_id,))
                    for g in guests_with_student:
                        if g in guests_on_table:
                            valid = False
                            guest_seat_number = table_plan.query_db("SELECT seat_number FROM people_in_tables WHERE guest_id = ?",(g["guest_id"],))
                            for v in changes:
                                if v[2] == val[2]: #so same table number
                                    if guest_seat_number[0]["seat_number"] == v[3]:
                                        valid = True
                            if not valid:
                                student = table_plan.query_db("SELECT forename,surname FROM RGS_students WHERE student_id = ? COLLATE NOCASE",(student_id,))
                                guest = table_plan.query_db("SELECT forename,surname FROM Guests WHERE guest_id = ?",(g["guest_id"],))
                                return "The student {0} {1} cannot be removed since they are on the same table as their guest {2} {3}. Please delete the guest before trying to delete the RGS student.".format(student[0]["forename"],student[0]["surname"],guest[0]["forename"],guest[0]["surname"])

                table_plan.query_db("DELETE FROM people_in_tables WHERE table_number = ? AND seat_number = ? COLLATE NOCASE",(val[2],val[3]))

            else:
                student_id = table_plan.query_db("SELECT student_id FROM RGS_students WHERE forename = ? AND surname = ? COLLATE NOCASE",(val[0],val[1]))
                if len(student_id) == 0:
                    guest_id = table_plan.query_db("SELECT guest_id FROM Guests WHERE forename = ? AND surname = ? COLLATE NOCASE",(val[0],val[1]))
                    if len(guest_id) == 0:
                        return "No student or guest found with name {0} {1}".format(val[0],val[1])
                    else:
                        guest_links = table_plan.query_db("SELECT student_id FROM student_guest_link WHERE guest_id = ? COLLATE NOCASE",(guest_id[0]["guest_id"],))
                        if len(guest_links) == 0:
                            return "The guest is not associated with a student. This should not be possible"


                else:
                    table_plan.query_db("DELETE FROM people_in_tables WHERE table_number = ? AND seat_number = ?",(val[2],val[3]))
                    table_plan.query_db("INSERT INTO people_in_tables(table_number,student_id,seat_number,modified_by_id) VALUES (?,?,?,?)",(val[2],student_id[0]["student_id"],val[3],modifying_student_id))

        student_ids = table_plan.query_db("SELECT student_id FROM people_in_tables")
        for i,id in enumerate(student_ids):
            id = id["student_id"]
            student_ids[i] = id
        while None in student_ids:
            student_ids.remove(None)
        student_ids_set = set(student_ids)
        guest_ids = table_plan.query_db("SELECT guest_id FROM people_in_tables")
        for i,id in enumerate(guest_ids):
            id = id["guest_id"]
            guest_ids[i] = id
        while None in guest_ids:
            guest_ids.remove(None)
        guest_ids_set = set(guest_ids)
        if len(student_ids) == len(student_ids_set):
            if len(guest_ids) == len(guest_ids_set):
                table_plan.query_db("COMMIT")
                for val in changes:
                    if val[0] == None and val[1] == None:
                        pass
                    else:
                        student_id = table_plan.query_db("SELECT student_id FROM RGS_students WHERE forename = ? AND surname = ? COLLATE NOCASE",(val[0],val[1]))
                        if len(student_id) == 0: #if student_id is zero, then len(guest_id) must be >0 since validation done above
                            guest_id = table_plan.query_db("SELECT guest_id FROM Guests WHERE forename = ? AND surname = ? COLLATE NOCASE",(val[0],val[1]))
                            students_on_table = table_plan.query_db("SELECT student_id FROM people_in_tables WHERE table_number = ? COLLATE NOCASE",(val[2],))
                            valid = False
                            for student_dict in students_on_table:
                                if guest_links[0]["student_id"] == student_dict["student_id"]:
                                    valid = True
                            if valid:
                                table_plan.query_db("DELETE FROM people_in_tables WHERE table_number = ? AND seat_number = ?",(val[2],val[3]))
                                table_plan.query_db("INSERT INTO people_in_tables(table_number,guest_id,seat_number,modified_by_id) VALUES (?,?,?,?)",(val[2],guest_id[0]["guest_id"],val[3],modifying_student_id))
                            else:
                                student = table_plan.query_db("SELECT forename,surname FROM RGS_students WHERE student_id = ?",(guest_links[0]["student_id"],))
                                return "Any guest must be placed on the same table as the student resposable for them. Guest {0} {1} must be placed on the same table as {2} {3}".format(val[0],val[1],student[0]['forename'],student[0]['surname'])
            else:
                for id in guest_ids_set:
                    guest_ids.remove(id)
                table_plan.query_db("ROLLBACK")
                guest = table_plan.query_db("SELECT forename,surname FROM guests WHERE guest_id = ?",(guest_ids[0],))[0]
                return "There are duplicate students. Guest {0} {1} is entered multiple times".format(guest["forename"],guest["surname"])

        else:
            for id in student_ids_set:
                student_ids.remove(id)
            table_plan.query_db("ROLLBACK")
            student = table_plan.query_db("SELECT forename,surname FROM RGS_students WHERE student_id = ?",(student_ids[0],))[0]
            return "There are duplicate students. Student {0} {1} is entered multiple times".format(student["forename"],student["surname"])


        return "All OK"

if __name__ == "__main__":
    app.run()
