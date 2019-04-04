// http://www.cnblogs.com/pengjw/p/3439753.html
function detectBrowser() {
    ua = navigator.userAgent;
    ua = ua.toLocaleLowerCase();

    if (ua.match(/msie/) != null || ua.match(/trident/) != null) {
        browserType = "IE";
        //哈哈，现在可以检测ie11.0了！
        browserVersion = ua.match(/msie ([\d.]+)/) != null ? ua.match(/msie ([\d.]+)/)[1] : ua.match(/rv:([\d.]+)/)[1];
    } else if (ua.match(/firefox/) != null) {
        browserType = "火狐";
    } else if (ua.match(/opera/) != null) {
        browserType = "欧朋";
    } else if (ua.match(/chrome/) != null) {
        browserType = "谷歌";
    } else if (ua.match(/safari/) != null) {
        browserType = "Safari";
    }
    var arr = new Array( browserType, browserVersion);
    return arr;
}
