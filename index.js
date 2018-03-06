var myDB = {
    name: 'test',
    version: 4,
    db: null
}
var students = [{
    id: 1001,
    name: "Byron",
    age: 24
}, {
    id: 1002,
    name: "Frank",
    age: 30
}, {
    id: 1003,
    name: "Aaron",
    age: 26
}];
//开启数据库
function openDB(name, version) {
    var version = version || 1;
    var request = window.indexedDB.open(name, version);
    request.onerror = function (e) {
        console.log(e.currentTarget.error.message);
    }
    request.onsuccess = function (e) {
        myDB.db = e.target.result;
    }
    //版本变更
    request.onupgradeneeded = function (e) {
        var db = e.target.result;

        // 删除object store
        // if (db.objectStoreNames.contains('students')) {
        //     db.deleteObjectStore('students');
        // }

        if (!db.objectStoreNames.contains('students')) {
            //id为key
            var store = db.createObjectStore('students', {
                keyPath: 'id'
            });

            //主键自增长
            // db.createObjectStore('students', {
            //     autoIncrement: true
            // });

            //创建索引(索引名称,索引属性字段名,索引属性值是否唯一)
            store.createIndex('nameIndex', 'name', {
                unique: true
            });
            store.createIndex('ageIndex', 'age', {
                unique: false
            });
        }
        console.log('version is' + version);
    }
}
//关闭数据库
function closeDB(db) {
    db.close();
}
//删除数据库
function deleteDB(name) {
    indexedDB.deleteDatabase(name);
}
//插入数据
function addData(db, storename) {
    var store = db.transaction(storename, 'readwrite').objectStore(storename);
    for (var i = 0; i < students.length; i++) {
        store.add(students[i]);
    }
}
//查询数据
function getDataByKey(db, storeName, value) {
    var transaction = db.transaction(storeName, 'readwrite');
    var store = transaction.objectStore(storeName);
    var request = store.get(value);
    request.onsuccess = function (e) {
        var student = e.target.result;
        console.log(student.name);
    };
}
//更新数据
function updateDataByKey(db, storeName, value) {
    var transaction = db.transaction(storeName, 'readwrite');
    var store = transaction.objectStore(storeName);
    var request = store.get(value);
    request.onsuccess = function (e) {
        var student = e.target.result;
        student.age = 35;
        store.put(student);
    };
}
//删除数据
function deleteDataByKey(db, storeName, value) {
    var transaction = db.transaction(storeName, 'readwrite');
    var store = transaction.objectStore(storeName);
    store.delete(value);
}
//清空数据
function clearObjectStore(db, storeName) {
    var transaction = db.transaction(storeName, 'readwrite');
    var store = transaction.objectStore(storeName);
    store.clear();
}
//利用索引取值
function getDataByIndex(db,storeName){
    var transaction=db.transaction(storeName);
    var store=transaction.objectStore(storeName);
    var index = store.index("nameIndex");
    index.get('Byron').onsuccess=function(e){
        var student=e.target.result;
        console.log(student.id);
    }
}
//游标
function fetchStoreByCursor(db,storeName){
    var transaction=db.transaction(storeName);
    var store=transaction.objectStore(storeName);
    var request=store.openCursor();
    request.onsuccess=function(e){
        var cursor=e.target.result;
        if(cursor){
            console.log(cursor.key);
            var currentStudent=cursor.value;
            console.log(currentStudent.name);
            cursor.continue();
        }
    };
}
//获取下标为age 26的student
function getMultipleData(db,storeName){
    var transaction=db.transaction(storeName);
    var store=transaction.objectStore(storeName);
    var index = store.index("ageIndex");
    var request=index.openCursor(IDBKeyRange.only(26))
    request.onsuccess=function(e){
        var cursor=e.target.result;
        if(cursor){
            var student=cursor.value;
            console.log(student.id);
            cursor.continue();
        }
    }
}
//制定游标范围，获取名字首字母在B-E的student
function getMultipleData(db,storeName){
    var transaction=db.transaction(storeName);
    var store=transaction.objectStore(storeName);
    var index = store.index("nameIndex");
    var request=index.openCursor(IDBKeyRange.bound('B','F',false,
true
));
    request.onsuccess=function(e){
        var cursor=e.target.result;
        if(cursor){
            var student=cursor.value;
            console.log(student.name);
            cursor.continue();
        }
    }
}
openDB(myDB.name, myDB.version);

//因为创建数据库是异步的所以需要定时操作。
setTimeout(function () {
    // addData(myDB.db, 'students');
    // closeDB(myDB.db);
    // deleteDB('test');
    getDataByIndex(myDB.db,'students');
}, 1000);