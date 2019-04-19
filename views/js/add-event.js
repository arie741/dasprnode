var toolbarOptions = [
['bold', 'italic', 'underline', 'strike'],        // toggled buttons
['blockquote', 'code-block'],
['link'],
['video'],
[{ 'header': 1 }, { 'header': 2 }],               // custom button values
[{ 'list': 'ordered'}, { 'list': 'bullet' }],
[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
[{ 'direction': 'rtl' }],                         // text direction
[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
[{ 'font': ['sans serif','monospace'] }],
[{ 'align': [] }],
['clean']                                         // remove formatting button
];

var editor = new Quill('#ne-textarea #editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#ne-entextarea #editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

function contentChange(econtent, enecontent){
    $('#input-editor').val(econtent);
    $('#eninput-editor').val(enecontent);
};

$('#ne-input-submit').attr('onclick', 'contentChange($("#ne-textarea #editor").html(), $("#ne-entextarea #editor").html())');
$('#ne-questionaire').attr('style', 'display:none');

function changeType(opval){
    switch (opval) {
        case "events":
        $('#ne-textarea').attr('style', 'display:block');
        $('#ne-entextarea').attr('style', 'display:block');
        $('#ne-input-submit').attr('onclick', 'contentChange($("#ne-textarea #editor").html(), $("#ne-entextarea #editor").html())');
        $('#ne-questionaire').attr('style', 'display:none');
        break;
        case "news":
        $('#ne-textarea').attr('style', 'display:block');
        $('#ne-entextarea').attr('style', 'display:block');
        $('#ne-input-submit').attr('onclick', 'contentChange($("#ne-textarea #editor").html(), $("#ne-entextarea #editor").html())');
        $('#ne-questionaire').attr('style', 'display:none');
        break;
        case "questionaire":
        $('#ne-textarea').attr('style', 'display:none');
        $('#ne-entextarea').attr('style', 'display:none');
        $('#ne-input-submit').attr('onclick', 'contentChange(equestionaire)');
        $('#ne-questionaire').attr('style', 'display:flex');
    }
}
