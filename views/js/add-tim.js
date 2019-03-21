var toolbarOptions = [
['bold', 'italic', 'underline', 'strike'],        // toggled buttons
['blockquote', 'code-block'],
['link'],
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

var editor = new Quill('#keterangan-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#overview-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#riset-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#publikasi-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#supervisi-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

function contentChange(){
    $('#input-keterangan').val($("#keterangan-editor .ql-editor").html());
    $('#input-overview').val($("#overview-editor .ql-editor").html());
    $('#input-riset').val($("#riset-editor .ql-editor").html());
    $('#input-publikasi').val($("#publikasi-editor .ql-editor").html());
    $('#input-supervisi').val($("#supervisi-editor .ql-editor").html());
};

$('#tk-input-submit').attr('onclick', 'contentChange()');
