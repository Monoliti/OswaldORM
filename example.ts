import {fields} from "oswaldorm"
import {Model, Database} from "oswaldorm/db"
import {SQLiteDatabase} from "oswaldorm/engines"

const db = new SQLiteDatabase({path:"db.sqlite"})

class Book extends Model {
    _databases = [db];

    name = fields.Character({maxLength:200, null:true, blank:true})
    tags = fields.Text({default: ""})
    cover = fields.Image({null:true, blank:true, uploadTo:this.getCoverURL})

    getCoverURL(){
        return "/books/" + this.id;
    }
}

Book.objects.all();
Book.objects.filter({nameIContains:"pokemon"});
Book.objects.create({
    name: "test",
    tags: "somenewtag",
    cover: new Image();
})

// osw-ctl migrate
// osw-ctl makemigrations
// osw-ctl preparedb

migration({
    name: "0001.2023-02-01T22:10:00",
    operations:[
        createTable({
            name: "main_book",
            fields: {
                id: fields.Number({primaryKey:true, }),
                name: fields.Character({maxLength: 200})
            }
        })
    ]})