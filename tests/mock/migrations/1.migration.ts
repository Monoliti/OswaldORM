import {migrations, fields} from "../../../src"

migrations.migration({
    name: "1-2024-03-08T19:52:58.418Z",
    operations:[
        migrations.createTable({
            name:"Book",
            database:"testDb",
            fields:{
                id: new fields.Number({"null":false,"blank":false,"primaryKey":true,"autoIncrement":true}),
				name: new fields.Character({"null":false,"blank":false,"maxLength":200})
            }
        })

    ]
})
