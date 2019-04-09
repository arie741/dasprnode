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

/*Bahasa Textarea*/
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
/**/
/*English Textarea*/
var editor = new Quill('#enketerangan-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#enoverview-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#enriset-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#enpublikasi-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});

var editor = new Quill('#ensupervisi-editor', {
modules: { toolbar: toolbarOptions },
theme: 'snow'
});
/**/

function contentChange(){
	/*Bahasa Textarea to input conversion*/
    $('#input-keterangan').val($("#keterangan-editor .ql-editor").html());
    $('#input-overview').val($("#overview-editor .ql-editor").html());
    $('#input-riset').val($("#riset-editor .ql-editor").html());
    $('#input-publikasi').val($("#publikasi-editor .ql-editor").html());
    $('#input-supervisi').val($("#supervisi-editor .ql-editor").html());
    /*English Textarea to input conversion*/
    $('#eninput-keterangan').val($("#enketerangan-editor .ql-editor").html());
    $('#eninput-overview').val($("#enoverview-editor .ql-editor").html());
    $('#eninput-riset').val($("#enriset-editor .ql-editor").html());
    $('#eninput-publikasi').val($("#enpublikasi-editor .ql-editor").html());
    $('#eninput-supervisi').val($("#ensupervisi-editor .ql-editor").html());
};

$('#tk-input-submit').attr('onclick', 'contentChange()');
