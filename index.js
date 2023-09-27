const jpdbBaseURL = 'http://api.login2explore.com:5577';
const jpdbIRL = '/api/irl';
const jpbdIML = '/api/iml';
const studentDatabaseName = 'SCHOOL-DB';
const studentRelationName = 'STUDENT-TABLE';
const connectionToken = '90931677|-31949327489766798|90961548';

$('#rollNo').focus();

function disableAllFeildExceptRollno() {
    $('#fullName').prop('disabled', true);
    $('#class').prop('disabled', true);
    $('#birthDate').prop('disabled', true);
    $('#inputAddress').prop('disabled', true);
    $('#enrollmentDate').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
    $('#saveBtn').prop('disabled', true);
    $('#updateBtn').prop('disabled', true);
}

function getStudentRollnoAsJsonObj() {
    let rollNO = $('#rollNo').val();
    let jsonStr = {
        id: rollNO
    };
    return JSON.stringify(jsonStr);
}

function saveRecNoToLocalStorage(jsonObject) {
    let lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}

function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#fullName').val("");
        $('#class').val("");
        $('#birthDate').val("");
        $('#inputAddress').val("");
        $('#enrollmentDate').val("");
    } else {
        // student record number saved to localstorage
        saveRecNoToLocalStorage(jsonObject);
        
        // parse json object into JSON
        let data = JSON.parse(jsonObject.data).record;
        
        $('#fullName').val(data.name);
        $('#class').val(data.className);
        $('#birthDate').val(data.birthDate);
        $('#inputAddress').val(data.address);
        $('#enrollmentDate').val(data.enrollmentData);
    }
}

function validateFormData() {
    let rollNo, name, className, birthDate, address, enrollmentData;
    rollNo = $('#rollNo').val();
    name = $('#fullName').val();
    className = $('#class').val();
    birthDate = $('#birthDate').val();
    address = $('#inputAddress').val();
    enrollmentData = $('#enrollmentDate').val();

    if (rollNo === '') {
        alert(0, 'Roll NO Missing');
        $('#rollNo').focus();
        return "";
    }

    if (rollNo <= 0) {
        alert(0, 'Invalid Roll-No');
        $('#rollNo').focus();
        return "";
    }

    if (className === '') {
        alert(0, 'Class Name is Missing');
        $('#class').focus();
        return "";
    }
    if (className <= 0 && className > 12) {
        alert(0, 'Invalid Class Name');
        $('#class').focus();
        return "";
    }
    if (birthDate === '') {
        alert(0, 'Birth Date Is Missing');
        $('#birthDate').focus();
        return "";
    }
    if (address === '') {
        alert(0, 'Address Is Missing');
        $('#address').focus();
        return "";
    }
    if (enrollmentData === '') {
        alert(0, 'Enrollment Data Is Missing');
        $('#enrollmentDate').focus();
        return "";
    }

    let jsonStrObj = {
        id: rollNo,
        name: name,
        className: className,
        birthDate: birthDate,
        address: address,
        enrollmentData: enrollmentData
    };
    
    return JSON.stringify(jsonStrObj);
}

function resetForm() {
    $('#rollNo').val("");
    $('#fullName').val("");
    $('#class').val("");
    $('#birthDate').val("");
    $('#inputAddress').val("");
    $('#enrollmentDate').val("");

    $('#rollNo').prop('disabled', false);
    disableAllFeildExceptRollno();
    $('#rollNo').focus();


}

async function getStudentData(){
    if ($('#rollNo').val() === "") { 
        disableAllFeildExceptRollno();
    } 
    else{
        let studentRollnoJsonObj = getStudentRollnoAsJsonObj();
        let getRequest = createGET_BY_KEYRequest(connectionToken, studentDatabaseName, studentRelationName, studentRollnoJsonObj);
        
        jQuery.ajaxSetup({async: false});
        let resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({async: true});
        
        $('#rollNo').prop('disabled', false);
        $('#fullName').prop('disabled', false);
        $('#class').prop('disabled', false);
        $('#birthDate').prop('disabled', false);
        $('#inputAddress').prop('disabled', false);
        $('#enrollmentDate').prop('disabled', false);

        if (resJsonObj.status === 400) {  
            $('#resetBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', true);
            await fillData("");
            $('#name').focus();
        } 
        else if (resJsonObj.status === 200) {
            $('#rollNO').prop('disabled', true);
            await fillData(resJsonObj);
            $('#resetBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', true);
            $('#name').focus();
        }
    }
}

async function saveData (){
    let jsonStrObj = validateFormData();

    if (jsonStrObj === ''){
        return '';
    }

    // create PUT Request object
    let putRequest = createPUTRequest(connectionToken, jsonStrObj, studentDatabaseName, studentRelationName);
    jQuery.ajaxSetup({async: false});
    
    //Make PUT Request for saving data into database
    let resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});

    if (resJsonObj.status === 400) {
        alert(0, `Data Is Not Saved ( Message: ${resJsonObj.message })`);
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alert(1, 'Data Saved successfully');
    }
    
    await resetForm();
    
    $('#rollNo').focus();
}

function changeData(){
    $('#changeBtn').prop('disabled', true);
    var jsonChg = validateFormData(); 
    
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, studentDatabaseName, studentRelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({async: false});
    
    //Make UPDATE Request
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});

    if (resJsonObj.status === 400) {// If data is not saved
        alert(0, `Data Is Not Update ( Message:  ${resJsonObj.message} )`);
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alert(1, 'Data Updated Successfully');
    }

    resetForm();
    $('#rollNo').focus();
}