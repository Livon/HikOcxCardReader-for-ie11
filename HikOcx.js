var d8e = {};

d8e.cardSerialNumOutput = 'blank-card-search-input';

d8e.httpService = {};

d8e.httpService.url = 'http://127.0.0.1:4320';

d8e.httpService.getCardInfo = d8e.httpService.url + '/plugin/service/getcardinfo?r=' + Math.random() ;

d8e.httpService.request = function ( url, data, callback, obj ) {

    let output = $('#'+ d8e.cardSerialNumOutput);
    output.val('');

    // $.getJSON( url,data,function( response, status, xhr ){
    //     var serialNum = $.parseJSON( response.data ).number ;
    //     output.val( serialNum );
    // });

    // $.post({
    //     // type: 'post',
    //     dataType: "json",
    //     url: url,
    //     data:data,
    //     success: function( response ) {
    //         if(response && response.data ){
    //             var serialNum = $.parseJSON( response.data ).number ;
    //             $('#'+ d8e.cardSerialNumOutput).val( serialNum );
    //         }
    //
    //     },
    //     error:function(XMLHttpRequest, textStatus, errorThrown){
    //         _this.installHttpServer();
    //     }
    // })

    var xmlHttp = null;

    if ( window.XMLHttpRequest ) {// code for IE7, Firefox, Opera, etc.
        xmlHttp = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {// code for IE6, IE5
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if ( xmlHttp != null ) {

        xmlHttp.open("POST", url, false);
        xmlHttp.send( data );
        // document.write( xmlHttp.responseText );
        var serialNum = $.parseJSON( xmlHttp.responseText ).data ;
        var serialNum = $.parseJSON( serialNum ).number ;
        output.val( serialNum );
    }
    else {
        alert("Your browser does not support XMLHTTP.");
    }

};

d8e.httpService.XDomainRequest = function( url,data,callback,obj ){

    var xdr = new window.XDomainRequest();
    xdr.onprogress = function() {}; // no aborting
    xdr.ontimeout = function() {}; // "
    xdr.onload = function(e) {
        debugger;
    };
    xdr.onerror = function(XMLHttpRequest, textStatus, errorThrown) {
        debugger;
        _this.installHttpServer();
    };
    xdr.open(this.opts.method, url, true);
    xdr.send(data);
};

d8e.getCardSerialNum = function( data, obj ){
    var url = d8e.httpService.getCardInfo;
    d8e.httpService.request( url, data, null, obj );
    // submitCookieTopForm( url, data );
};

(function($) {

    'use strict';

    $.Ocx = function(opts) {
        if(typeof jQuery == "undefined"){
            alert("请引入jquery文件");
        }else{
            this.opts = $.extend({}, $.Ocx.DEFAULTS, opts);
        }
    };

    $.Ocx.VERSION = '1.0';

    $.Ocx.tagName = 'ocx';

    $.Ocx.DEFAULTS = {
        isHttps:false,//默认http,必传
        httpUrl:"http://127.0.0.1:4320",
        httpsUrl:"https://127.0.0.1:8640",
        httpUrlLocal:"http://localhost:4320",
        httpsUrlLocal:'https://localhost:8640',
        method:"post",// 默认post
        loadUrl:"",// 主要针对分布式部署,必传
        tip:true, // 在控件未安装成功时，触发控件的请求，提示控件未安装
        elementID:"" // 触发控件的dom ID,可不传,传递了此参数,则未安装控件时,关闭弹出的提示安装窗口后,对应dom自动获得焦点,可避免再次触发请求
    };

    //Ocx.baseCode = new Base64();

    $.Ocx.prototype = {
        /**
         * 判断浏览器是否是ie8和ie9
         * @returns {boolean}
         */
        isIE89 : function () {
            return false;
        },
        /**
         * 判断使用http还是https
         * @returns {boolean}
         */
        httpUrlFun : function () {
            var url = "http://127.0.0.1:4320";
            return url;
            // let url = this.opts.httpsUrlLocal;
            // // IE下发与项目一样的协议，其他浏览器 统一发http协议.
            // if( !!window.ActiveXObject || "ActiveXObject" in window ){
            //     url = this.opts.httpsUrl;
            // }
            // //chrome在32位下  发127.0.0.1发不出去
            // let result = this.opts.isHttps ? url : this.opts.httpUrl;
            // debugger;
            // return result; // "http://127.0.0.1:4320"
        },

        // 提示用户安装服务
        installHttpServer : function(){
            debugger;
            if( this.opts.tip ){
                console.log('控件异常');
            }
        },
        /**
         * ie8和ie9利用XDomainRequest处理浏览器跨域请求
         * @returns {boolean}
         */
        xDomainAjax : function (url,data,callback,obj) {
            var xdr = new window.XDomainRequest();
            var _this = this;
            xdr.onprogress = function() {}; // no aborting
            xdr.ontimeout = function() {}; // "
            xdr.onload = function(e) {
                if(obj){
                    //读卡通用
                     if(xdr.responseText != "" && JSON.parse(xdr.responseText).data != ""
                         && JSON.parse(JSON.parse(xdr.responseText).data).number != ''){

                         if(JSON.parse(data).readertype == 5){
                             //ie下,蓝牙读卡器读取到初始数据后会输入到文本框中,需等待输入完毕后再替换成转换后的数据;否则存在原始数据未输入完毕,替换后的数据已经开始输入了,导致最后读取到的卡号会多出一到两位(多出的为蓝牙读卡器读到的初始数据);
                             setTimeout(function(){
                                 $(obj).val(JSON.parse(JSON.parse(xdr.responseText).data).number);
                             },100);
                         }
                         else{
                             $(obj).val(JSON.parse(JSON.parse(xdr.responseText).data).number);
                         }
                     }
                }else if(callback){
                    debugger;
                    //返回数据调用回调函数处理界面
                    return callback( $.parseJSON(xdr.responseText) );
                }else{
                    //关闭有界面时候用
                    return;
                }
            };
            xdr.onerror = function(XMLHttpRequest, textStatus, errorThrown) {
                _this.installHttpServer();
            };
            xdr.open(this.opts.method, url, true);
            xdr.send(data);
        },

        /**
         * 除ie8和ie9外的跨域请求，利用jquery原生的ajax
         * @returns {boolean}
         */
        normalAjax : function (url,data,callback,obj) {
            debugger;
            var _this = this,cardTypeData = data;
            // $._ajax({
            $.ajax({
                type: this.opts.method,
                //contentType: "application/json; charset=utf-8",
                //dataType: "json",
                url: url,
                data:data,
                success: function(data) {
                    if(obj){
                        //读卡通用
                        if(data.data != ""  && JSON.parse(data.data).number != ''){
                            if(JSON.parse(cardTypeData).readertype == 5){
                                //ie下,蓝牙读卡器读取到初始数据后会输入到文本框中,需等待输入完毕后再替换成转换后的数据;否则存在原始数据未输入完毕,替换后的数据已经开始输入了,导致最后读取到的卡号会多出一到两位(多出的为蓝牙读卡器读到的初始数据);
                                setTimeout(function(){
                                    $(obj).val(JSON.parse(data.data).number);
                                },100);
                            }
                            else{
                                $(obj).val(JSON.parse(data.data).number);
                            }
                        }
                    }else if(callback) {
                        //返回数据调用会掉函数处理界面
                        return callback(data);
                    }else{
                        //关闭有界面时候用
                        return;
                    }
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    _this.installHttpServer();
                }
            })
        },

        /**
         *  base64解码数据
         *  @param str:加密数据
         * @returns {object}
         */
        //decode : function(str){
        //    return this.baseCode.decode(str);
        //},

        // 抓拍图片
        catchPicture : function(data,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/facesnap";
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(data),callback);
            }else{
                this.normalAjax(_url,JSON.stringify(data),callback);
            }
        },

        //取消抓拍图片
        cancelCatch : function(){
            var _url = this.httpUrlFun() + "/plugin/execute/facesnap";
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify({"command":"close"}),null);
            }else{
                this.normalAjax(_url,JSON.stringify({"command":"close"}),null);
            }
        },

        /**
         *  (1) 读卡号处理
         *  @param reqData:当前读卡所需参数，obj:返回卡号所对应对象
         *  @returns {null}
         */
        requestCard : function( data, obj ){
            debugger;
            var url = d8e.httpService.getCardInfo;
            d8e.httpService.request( url, data, null, obj );
            // readertype ： 5 代表蓝牙
            // <READERTYPE>6</READERTYPE> // 发卡器类型:DS-K1F100-D8E
            // var _url = JSON.parse(data).readertype == 5 ? this.httpUrlFun() + "/plugin/execute/gettrd400cardno"
            //     : this.httpUrlFun() + "/plugin/service/getcardinfo";
            //
            // if(this.isIE89()){
            //     this.xDomainAjax(_url,data,null,obj);
            // }else{
            //     this.normalAjax(_url,data,null,obj);
            // }
        },

        /**
         *  读卡号参数处理:发卡器参数配置
         *  @param reqData:当前读卡所需参数，obj:返回卡号所对应对象
         * @returns {object}
         */
        paramCard : function(xmlObj){
            var params = {"readertype":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("READERTYPE")[0])),//设备类型
                "cmctype":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("CMCTYPE")[0])),//通信方式
                "serialport":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("SERIALPORT")[0])), //串口端口号///?
                "rate":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("RATE")[0])),
                "timeout":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("TIMEOUT")[0])),
                "cardtype":this.navigatorAgent(xmlObj.getElementsByTagName("CARDTYPE")[0]) != "undefined" ? parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("CARDTYPE")[0])) : 0,
                //"composedcardtype":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("COMPOSEDCARDTYPE")[0])),//卡类型
                "cardnotype":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("CARDNOTYPE")[0]))//卡号类型
            };
            if(params.readertype == '6'){
                params.composedcardtype = parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("COMPOSEDCARDTYPE")[0]));//d8e模式下可选
            }
            //var _data = {"readertype":6,
            //    "cmctype":1,
            //    "serialport":3,
            //    "rate":9600,
            //    "timeout":300,
            //    "beep":0,
            //    "cardtype":0,
            //    "cardnotype":0,
            //    "pems":0};
            console.log( 'params' );
            console.log( params );
            return params;
        },

        // 读卡
        readCard : function(cardNum,xmlObj,callback){
            var _url = this.httpUrlFun() + "/plugin/service/setcardinfo";
            var _cmsType = parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("CMCTYPE")[0])),
                _serialport = _cmsType == 1 ? parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("SERIALPORT")[0])) : 0;

            var params = {"readertype":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("READERTYPE")[0])),//设备类型
                "cmctype":_cmsType,//通信方式
                "serialport":_serialport, //串口端口号---当cmctype=1时有效
                "rate":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("RATE")[0])),
                "startnum":cardNum ? cardNum : "Serial"
            };
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback,null);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback,null);
            }
        },
        //身份证
        requestIdCard : function(data,callback){
            var _url = this.httpUrlFun() + "/plugin/service/getidcardinfo";
            if(this.isIE89()){
                this.xDomainAjax(_url,data,callback,null);
            }else{
                this.normalAjax(_url,data,callback,null);
            }
        },

        //身份证参数处理
        paramIdCard : function(xmlObj,time){
            //time为区分上下请求而添加的，例如人员dialog的修改和添加dialog之间的ajax请求，上一个没有返回，下一个dialog打开后，服务的请求会继续过来，导致请求之间混乱
            var IDReaderType = parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("IDReaderType")[0]));
            var ConnectType = IDReaderType == 4 ? parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("CMCTYPE")[0])) : 0; //如果readertype=4时,cmctype才有效
            var ComPort = ConnectType == 2 ? parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("COM")[0])) : 0; //如果cmctype=2时,串口端口号才有效
            var params = {token:time,
                          params:JSON.stringify({"readertype":IDReaderType,//设备类型
                                      "cmctype":ConnectType,//通信方式
                                      "serialport":ComPort})//串口端口号
                          };
            return params;

            //_dataBasicCard = {"readertype":4,
            //_dataBasicCard = {"readertype":4,
            //"cmctype":1,
            //"serialport":3,
            //"rate":9600,
            //"timeout":300,
            //"beep":0,
            //"cardtype":1,
            //"cardnotype":0,
            //"fillzero":0};
        },
        //指纹
        requestfinger : function(xmlObj,time,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/getfingerinfo";
            var params = {token:time,
                          params:JSON.stringify({"serialport":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("SerialPort")[0])),//指纹的串口号-配置
                            "rate":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("BandRate")[0])),//指纹的波特率-配置
                            "devno":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("DeviceNo")[0])), //装置代号
                            "devtype":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("DeviceType")[0]))}) //指纹的设备类型-配置

            };
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback,null);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback,null);
            }

            //  _data = {"serialport":3,//指静脉的串口号-配置
            //	"rate":9600,//指静脉的波特率-配置
            //	"devno":0,//装置代号
            //	"devtype":4 //4代表指静脉
            //};
        },
        requestVeinPrint : function(xmlObj,time,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/getfingerinfo";
            var params = {token:time,
                params:JSON.stringify({"serialport":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("SerialPort")[0])),//指纹的串口号-配置
                    "rate":parseInt(this.navigatorAgent(xmlObj.getElementsByTagName("BandRate")[0])),//指纹的波特率-配置
                    "devno":0,//指静脉默认传0
                    "devtype":4 //4=VENA（指静脉）
                })
            };
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback,null);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback,null);
            }
        },

        /**
         *  获取不同浏览器传过来的cookie文本
         *  @param obj:cookie字段
         * @returns {string}
         */
        navigatorAgent : function(obj){
            if(obj){
                return $(obj)[0].textContent;
                // console.log( $(obj) );
                // console.log( $(obj)[0].textContent );
                // if (navigator.userAgent.indexOf("MSIE") > 0){
                //     return obj.text;
                // }else{
                //     return obj.textContent;
                // }
            }
        },

        /**
         *  读卡号处理
         *  @param reqData:当前读卡所需参数，obj:返回卡号所对应对象
         * @returns {null}
         */
        writeCard : function(data,callback){
            var _url = this.httpUrlFun() + "/plugin/service/setcardinfo";
            if(this.isIE89()){
                this.xDomainAjax(_url,data,callback,null);
            }else{
                this.normalAjax(_url,data,callback,null);
            }
        },
        // 获取cookie 里的 castgc
        getCastgc : function(){
            var cookies = document.cookie.split("; ");
            var castgc = "";
            $.each(cookies,function(n,index){
                if(/CASTGC/g.test(index)){
                    castgc = index.split("=")[1];
                }
            });
            return castgc;
        },
        //获取当前端口
        getCurrentPort : function(){
            //如果系统没有配置端口,默认http:80端口,https:443端口
            //return 80;
            if(window.location.protocol == "http:"){ return 80; } else {return 443;}
        },

        //打印访客单
        printRvs : function(xmlObj){
            var tmp = new Base64();
            var visitorcode = this.navigatorAgent(xmlObj.getElementsByTagName("VisitorCode")[0]),//访客单编号
                visitorname = this.navigatorAgent(xmlObj.getElementsByTagName("VisitorName")[0]),   //访客姓名
                gender = this.navigatorAgent(xmlObj.getElementsByTagName("Gender")[0]),//访客性别
                idtype = this.navigatorAgent(xmlObj.getElementsByTagName("IDType")[0]), //证件类型
                idno = this.navigatorAgent(xmlObj.getElementsByTagName("IDNo")[0]), //证件号码
                photourl = this.navigatorAgent(xmlObj.getElementsByTagName("PhotoUrl")[0]), //头像URL
                logourl = this.navigatorAgent(xmlObj.getElementsByTagName("LogoBkUrl")[0]), //背景URL
                registertime = this.navigatorAgent(xmlObj.getElementsByTagName("RegisterTime")[0]), //登记时间
                plandeparture = this.navigatorAgent(xmlObj.getElementsByTagName("PlanDeparture")[0]), //计划离开时间
                actualdeparture = this.navigatorAgent(xmlObj.getElementsByTagName("ActualDeparture")[0]), //实际离开时间
                hostname = this.navigatorAgent(xmlObj.getElementsByTagName("HostName")[0]), //被访人姓名
                codetype = this.navigatorAgent(xmlObj.getElementsByTagName("CodeType")[0]), //二维码0，条形码1
                barcodeurl = this.navigatorAgent(xmlObj.getElementsByTagName("codeUrl")[0]), //二维码、条形码URL
                reason = this.navigatorAgent(xmlObj.getElementsByTagName("Purpose")[0]); //事由

            var _url = this.httpUrlFun() + "/plugin/execute/printvisitorticket",
                reg = /[\u4E00-\u9FA5]/g,
                params = {"pagesize":2,     //访客单大小。1=大号，2=小号
                    "visitorcode":visitorcode,//访客单编号
                    "visitorname":reg.test(visitorname) ? tmp.encode(visitorname) : visitorname,   //访客姓名 reg.test(visitorname)
                    "gender":tmp.encode(gender),//访客性别
                    "idtype":reg.test(idtype) ? tmp.encode(idtype) : idtype, //证件类型
                    "idno":idno, //证件号码
                    "photourl":photourl, //头像URL
                    "logourl":logourl, //背景URL
                    "registertime":registertime, //登记时间
                    "plandeparture":plandeparture, //计划离开时间
                    "actualdeparture":actualdeparture, //实际离开时间
                    "hostname":reg.test(hostname) ? tmp.encode(hostname) : hostname, //被访人姓名
                    "codetype":codetype, //二维码0，条形码1
                    "barcodeurl":barcodeurl, //二维码、条形码URL
                    "reason":reg.test(reason) ? tmp.encode(reason) : reason //事由
                };

            // var _url = this.httpUrlFun() + "/plugin/execute/printvisitorticket",
            //     params = {"pagesize":2,     //访客单大小。1=大号，2=小号
            //     "visitorcode":this.navigatorAgent(xmlObj.getElementsByTagName("VisitorCode")[0]),//访客单编号
            //     "visitorname":this.navigatorAgent(xmlObj.getElementsByTagName("VisitorName")[0]),   //访客姓名
            //     "gender":this.navigatorAgent(xmlObj.getElementsByTagName("Gender")[0]),//访客性别
            //     "idtype":this.navigatorAgent(xmlObj.getElementsByTagName("IDType")[0]), //证件类型
            //     "idno":this.navigatorAgent(xmlObj.getElementsByTagName("IDNo")[0]), //证件号码
            //     "photourl":this.navigatorAgent(xmlObj.getElementsByTagName("PhotoUrl")[0]), //头像URL
            //     "logourl":this.navigatorAgent(xmlObj.getElementsByTagName("LogoBkUrl")[0]), //背景URL
            //     "registertime":this.navigatorAgent(xmlObj.getElementsByTagName("RegisterTime")[0]), //登记时间
            //     "plandeparture":this.navigatorAgent(xmlObj.getElementsByTagName("PlanDeparture")[0]), //计划离开时间
            //     "actualdeparture":this.navigatorAgent(xmlObj.getElementsByTagName("ActualDeparture")[0]), //实际离开时间
            //     "hostname":this.navigatorAgent(xmlObj.getElementsByTagName("HostName")[0]), //被访人姓名
            //     "codetype":this.navigatorAgent(xmlObj.getElementsByTagName("CodeType")[0]), //二维码0，条形码1
            //     "barcodeurl":this.navigatorAgent(xmlObj.getElementsByTagName("codeUrl")[0]), //二维码、条形码URL
            //     "reason":this.navigatorAgent(xmlObj.getElementsByTagName("Purpose")[0]) //事由
            // };
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),null,null);
            }else{
                this.normalAjax(_url,JSON.stringify(params),null,null);
            }
        },
        //多路-实时预览和录像回放
        videoPlay: function(params,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/vssworkstation";

            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }
        },

        //单路-预览
        singlePreview: function(params,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/SinglePreview";

            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }
        },
        //单路-回放
        singlePlayback: function(params,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/SinglePlayBack";

            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }
        },

        //在线侦测
        sadpOcx: function(callback){
            var _url = this.httpUrlFun() + "/plugin/execute/Sadp_EXE";

            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify({'Sadp_ExE':'Sadp_ExE'}),callback == null ? null : callback);
            }else{
                this.normalAjax(_url,JSON.stringify({'Sadp_ExE':'Sadp_ExE'}),callback == null ? null : callback);
            }
        },
        //智能配置
        smartConfig: function(params,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/smartconfig";
            var tmp = new Base64(),reg = /[\u4E00-\u9FA5]/g;
                params.strWndName = reg.test(params.strWndName) ? tmp.encode(params.strWndName) : params.strWndName;//对中文进行base64转码
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }

       },
        //打印优惠券
        printCoupon: function (xmlObj, callback) {
            var self = this,
                _url = this.httpUrlFun() + "/plugin/execute/printcodebar",
                params,
                couponindexcodes = [];

            var couponIndexCodeObjs = xmlObj.getElementsByTagName("couponIndexCode");

            if (!couponIndexCodeObjs.length) return;

            $.each(couponIndexCodeObjs, function () {
                couponindexcodes.push(self.navigatorAgent(this));
            });

            params = {
                "merchantname": this.navigatorAgent(xmlObj.getElementsByTagName("merchantName")[0]),//访客单编号
                "parkname": this.navigatorAgent(xmlObj.getElementsByTagName("parkName")[0]),   //访客姓名
                "deductrulename": this.navigatorAgent(xmlObj.getElementsByTagName("deductRuleName")[0]),//访客性别
                "starttime": this.navigatorAgent(xmlObj.getElementsByTagName("startTime")[0]), //证件类型
                "endtime": this.navigatorAgent(xmlObj.getElementsByTagName("endTime")[0]), //证件号码
                "couponindexcodes": couponindexcodes
            };
            if (this.isIE89()) {
                this.xDomainAjax(_url, JSON.stringify(params), callback, null);
            } else {
                this.normalAjax(_url, JSON.stringify(params), callback, null);
            }
        },

        //1T60L 人脸录入和人脸下发
        enterFace : function(params,callback){
            var _url = this.httpUrlFun() + "/plugin/execute/facerecognize";
            if(this.isIE89()){
                this.xDomainAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }else{
                this.normalAjax(_url,JSON.stringify(params),callback == null ? null : callback);
            }
        }

    };
})(jQuery);