const {ipcRenderer} = window.require('electron');
// md输入和渲染
var editor
function edit_new(file_content='', type="ace/mode/markdown", themes="ace/theme/tomorrow") {
    editor = ace.edit("editor");
    editor.setFontSize(15);	//字体大小
    document.getElementById("editor").style.lineHeight = "25px";
    editor.setReadOnly(false);
    editor.setOption("wrap", "free");
    editor.setTheme(themes);
    editor.session.setMode(type);
    editor.setOptions({
        enableBasicAutocompletion: true, enableSnippets: true, enableLiveAutocompletion: true
    });
    editor.setHighlightActiveLine(true);
    editor.setShowPrintMargin(false);
    editor.getSession().setUseWorker(false);
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setUseSoftTabs(true);
    editor.session.setValue(file_content);
    document.onkeydown = function () {
        // 判断 Ctrl+S
        if (event.ctrlKey === true && event.keyCode === 83) {
            SaveChanges();
            event.preventDefault();
        }
    }
}

var isIE = !(!document.all);

function onMarkdown() {
    lute = Lute.New();
    const html2MdRenderer = {
        renderLinkDest: function (node, entering) {
            if (entering) {
                console.log('重写 LinkDest 节点', node.__internal_object__.typ, node.TokensStr(), entering);
                return [node.TokensStr(), Lute.WalkContinue]
            } else {
                return ["", Lute.WalkContinue]
            }
        }, renderBang: function (node, entering) {
            if (entering) {
                console.log('重写 Bang 节点', node.TokensStr(), entering);
                return ["!", Lute.WalkContinue]
            } else {
                return ["", Lute.WalkContinue]
            }
        },
    };
    lute.SetJSRenderers({
        "renderers": {
            "HTML2Md": html2MdRenderer,
        }
    });
    console.log(lute)
    const result = lute.MarkdownStr("", editor.getValue());
    document.getElementById('md-output').innerHTML = result;
    hljs.highlightAll();
    ipcRenderer.send('init-file-save', editor.getValue());
    console.log(result, lute.HTML2Md(result), lute.RenderJSON(editor.getValue()))
}

//顶栏
const pickerOptions = {
    onEmojiSelect: function (n) {
        editor.insert(n.shortcodes);
        document.getElementsByClassName("emojis-icon")[0].onclick()
        onMarkdown()
    }, i18n: {
        "search": "搜索",
        "search_no_results_1": "哦不！",
        "search_no_results_2": "没有找到相关表情",
        "pick": "选择一个表情…",
        "add_custom": "添加自定义表情",
        "categories": {
            "activity": "活动",
            "custom": "自定义",
            "flags": "旗帜",
            "foods": "食物与饮品",
            "frequent": "最近使用",
            "nature": "动物与自然",
            "objects": "物品",
            "people": "表情与角色",
            "places": "旅行与景点",
            "search": "搜索结果",
            "symbols": "符号"
        },
        "skins": {
            "choose": "选择默认肤色", "1": "默认", "2": "白色", "3": "偏白", "4": "中等", "5": "偏黑", "6": "黑色"
        }
    }
}
const picker = new EmojiMart.Picker(pickerOptions)
document.getElementById('main').append(picker)
document.getElementsByTagName('em-emoji-picker')[0].style.display = "none";
document.getElementsByClassName("md-h")[0].style.display = "none";
document.getElementsByClassName("emojis-icon")[0].onclick = function () {
    if (document.getElementsByTagName('em-emoji-picker')[0].style.display === "none") {
        document.getElementsByTagName('em-emoji-picker')[0].style.display = "flex";
    } else {
        document.getElementsByTagName('em-emoji-picker')[0].style.display = "none";
    }
} //表情菜单
document.getElementsByClassName("fout-size")[0].onclick = function () {
    if (document.getElementsByClassName("md-h")[0].style.display === "none") {
        document.getElementsByClassName("md-h")[0].style.display = "flex";
    } else {
        document.getElementsByClassName("md-h")[0].style.display = "none";
    }
} //字体菜单
document.getElementsByClassName("button-h1")[0].onclick = function () {
    editor.insert("\n# ");
    document.getElementsByClassName("fout-size")[0].onclick();
    onMarkdown()
} //h1
document.getElementsByClassName("button-h2")[0].onclick = function () {
    editor.insert("\n## ");
    document.getElementsByClassName("fout-size")[0].onclick();
    onMarkdown()
} //h2
document.getElementsByClassName("button-h3")[0].onclick = function () {
    editor.insert("\n### ");
    document.getElementsByClassName("fout-size")[0].onclick();
    onMarkdown()
} //h3
document.getElementsByClassName("button-h4")[0].onclick = function () {
    editor.insert("\n#### ");
    document.getElementsByClassName("fout-size")[0].onclick();
    onMarkdown()
} //h4
document.getElementsByClassName("button-h5")[0].onclick = function () {
    editor.insert("\n##### ");
    document.getElementsByClassName("fout-size")[0].onclick();
    onMarkdown()
} //h5
document.getElementsByClassName("button-h6")[0].onclick = function () {
    editor.insert("\n####### ");
    document.getElementsByClassName("fout-size")[0].onclick();
    onMarkdown()
} //h6

document.getElementsByClassName("bold")[0].onclick = function () {
    if (editor.getSelectionRange().start.row === editor.getSelectionRange().end.row&&editor.getSelectionRange().start.column === editor.getSelectionRange().end.column) {
        editor.insert("****");
        editor('editor').moveCursorTo(editor.getSelectionRange().start.row,editor.getSelectionRange().start.column-2);
    } else {
        if (editor.session.getTextRange(editor.getSelectionRange()).substring(0,2)=='**'&&editor.session.getTextRange(editor.getSelectionRange()).substring(editor.session.getTextRange(editor.getSelectionRange()).length-2)=='**') {
            editor.insert(editor.session.getTextRange(editor.getSelectionRange()).substring(2,editor.session.getTextRange(editor.getSelectionRange()).length-2));
        } else {
            editor.insert('**' + editor.session.getTextRange(editor.getSelectionRange()) + '**');
        }
    }
    onMarkdown()
} //加粗
document.getElementsByClassName("italic")[0].onclick = function () {
    if (editor.getSelectionRange().start.row === editor.getSelectionRange().end.row&&editor.getSelectionRange().start.column === editor.getSelectionRange().end.column) {
        editor.insert("**");
        editor('editor').moveCursorTo(editor.getSelectionRange().start.row,editor.getSelectionRange().start.column-1);
    } else {
        if (editor.session.getTextRange(editor.getSelectionRange()).substring(0,1)=='*'&&editor.session.getTextRange(editor.getSelectionRange()).substring(editor.session.getTextRange(editor.getSelectionRange()).length-1)=='*') {
            editor.insert(editor.session.getTextRange(editor.getSelectionRange()).substring(1,editor.session.getTextRange(editor.getSelectionRange()).length-1));
        } else {
            editor.insert('*' + editor.session.getTextRange(editor.getSelectionRange()) + '*');
        }
    }
    onMarkdown()
} //斜体
document.getElementsByClassName("del")[0].onclick = function () {
    if (editor.getSelectionRange().start.row === editor.getSelectionRange().end.row&&editor.getSelectionRange().start.column === editor.getSelectionRange().end.column) {
        editor.insert("~~~~");
        editor.moveCursorTo(editor.getSelectionRange().start.row,editor.getSelectionRange().start.column-2);
    } else {
        if (editor.session.getTextRange(editor.getSelectionRange()).substring(0,2)=='~~'&&editor.session.getTextRange(editor.getSelectionRange()).substring(editor.session.getTextRange(editor.getSelectionRange()).length-2)=='~~') {
            editor.insert(editor.session.getTextRange(editor.getSelectionRange()).substring(2,editor.session.getTextRange(editor.getSelectionRange()).length-2));
        } else {
            editor.insert('~~' + editor.session.getTextRange(editor.getSelectionRange()) + '~~');
        }
    }
    onMarkdown()
} //删除线
document.getElementsByClassName("url")[0].onclick = function () {
    if (editor.getSelectionRange().start.row === editor.getSelectionRange().end.row&&editor.getSelectionRange().start.column === editor.getSelectionRange().end.column) {
        editor.insert("[]()");
        editor.moveCursorTo(editor.getSelectionRange().start.row,editor.getSelectionRange().start.column-3);
    } else {
        if (editor.session.getTextRange(editor.getSelectionRange()).indexOf('http') > -1) {
            editor.insert('[](' + editor.session.getTextRange(editor.getSelectionRange()) + ')');
        } else {
            editor.insert('[' + editor.session.getTextRange(editor.getSelectionRange()) + ']()');
        }
    }
    onMarkdown()
}; //网址
// 系统菜单
function max() {
    let max = document.getElementById('max');
    //发送最大化命令
    ipcRenderer.send('window-max');
    //最大化图形切换
    if (max.getAttribute('type') == 'max') {
        max.setAttribute('type', 'unmax');
        //document.getElementsByClassName('body')[0].style.borderRadius='10px'
        max.innerHTML = '<svg t="1661710846548" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7666" width="200" height="200"><path d="M855 160.1l-189.2 23.5c-6.6 0.8-9.3 8.8-4.7 13.5l54.7 54.7-153.5 153.5c-3.1 3.1-3.1 8.2 0 11.3l45.1 45.1c3.1 3.1 8.2 3.1 11.3 0l153.6-153.6 54.7 54.7c4.7 4.7 12.7 1.9 13.5-4.7L863.9 169c0.7-5.2-3.7-9.6-8.9-8.9zM416.6 562.3c-3.1-3.1-8.2-3.1-11.3 0L251.8 715.9l-54.7-54.7c-4.7-4.7-12.7-1.9-13.5 4.7L160.1 855c-0.6 5.2 3.7 9.5 8.9 8.9l189.2-23.5c6.6-0.8 9.3-8.8 4.7-13.5l-54.7-54.7 153.6-153.6c3.1-3.1 3.1-8.2 0-11.3l-45.2-45z" p-id="7667"></path></svg>'
    } else {
        max.setAttribute('type', 'max');
        //document.getElementsByClassName('body')[0].style.borderRadius='0'
        max.innerHTML = '<svg t="1661710957487" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7805" width="200" height="200"><path d="M881.7 187.4l-45.1-45.1c-3.1-3.1-8.2-3.1-11.3 0L667.8 299.9l-54.7-54.7c-4.7-4.7-12.7-1.9-13.5 4.7L576.1 439c-0.6 5.2 3.7 9.5 8.9 8.9l189.2-23.5c6.6-0.8 9.3-8.8 4.7-13.5l-54.7-54.7 157.6-157.6c3-3 3-8.1-0.1-11.2zM439 576.1l-189.2 23.5c-6.6 0.8-9.3 8.9-4.7 13.5l54.7 54.7-157.5 157.5c-3.1 3.1-3.1 8.2 0 11.3l45.1 45.1c3.1 3.1 8.2 3.1 11.3 0l157.6-157.6 54.7 54.7c4.7 4.7 12.7 1.9 13.5-4.7L447.9 585c0.7-5.2-3.7-9.6-8.9-8.9z" p-id="7806"></path></svg>'
    }
}

function min() {
    //发送最小化命令
    ipcRenderer.send('window-min');
}

function winclose() {
    //发送关闭命令
    ipcRenderer.send('window-close');
}

function openmd() {
    //打开文件
    ipcRenderer.send('file-open');
}

function savemd() {
    //保存文件
    ipcRenderer.send('file-save', editor.getValue());
}

ipcRenderer.send('init-file-open');

ipcRenderer.on('file-return', function (event, arg) {
    editor.setValue(arg);
    onMarkdown();
})

ipcRenderer.on('error', function (event, arg) {
    alert(arg);
})
