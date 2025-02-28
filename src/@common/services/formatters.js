import Vue from 'vue';
import moment from 'moment';
import numeral from 'numeral';
import JsonUtils from './../utils/JsonUtils';
import mustache from 'mustache';
import {marked,lexer } from 'marked';
import DataProcessor from './processor.js';
import { MyFunc } from './global.js';

var CONTACT_LABELS_DICT = {};
var CONTACT_TAGS_DICT = {};

const timeZone = MyFunc.fixingDomainTime();
// let index = window.CONST.CONFIG.SETUP.POSTMAN_TIMEZONE_OFFSET?.indexOf(':');
// const timeZone = window.CONST.CONFIG.SETUP.POSTMAN_TIMEZONE_OFFSET?.slice(0, index) || Intl.DateTimeFormat().resolvedOptions().timeZone;
// const timeZone = 'Asia/Dhaka';
// const timeZone = 'America/New_York';
const options = { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit', 
  hour12: false, 
  timeZone: timeZone 
};

  const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  }
  const isTodayDomain = (someDate) => {
    let today = new Date();
    // let today = new Date().toLocaleString('en-US', { timeZone: timeZone });
    today = new Intl.DateTimeFormat('en-US', options).format(today);

    return moment(new Date(someDate)).get('date') == moment(new Date(today)).get('date') &&
      moment(new Date(someDate)).get('month') == moment(new Date(today)).get('month') &&
      moment(new Date(someDate)).get('year') == moment(new Date(today)).get('year')
  }

  function formatTime(timestamp,gap){
    if(!timestamp){
      return "";
    }

    const isoString = DataProcessor.domainTime(timestamp);
    let DATE2 = moment(isoString).format('YYYY-MM-DD HH:mm:ss');

    const isoString2 = DataProcessor.domainTime();
    const NOW2 = moment(isoString2).format('YYYY-MM-DD HH:mm:ss');

    let DIFF = moment(NOW2).diff(DATE2, 'day');
    DIFF = Math.abs(DIFF) // added to support past dates for which diff is negative

    if(DIFF < 1 && isTodayDomain(DATE2)){
      return moment(DATE2).format('h:mm a');
    } else if(DIFF < 3 ){
      return moment(DATE2).format('hh:mm a ddd');
    } else if(DIFF < 7 ){
      return moment(DATE2).format('h:mm a ddd');
    } else {
      return moment(DATE2).format('h:mm a DD MMM YY');
    }
  }
  function formatStamp(timestamp,gap) {
    const isoString = DataProcessor.domainTime(timestamp);

    return moment(isoString).format('h:mm a DD MMM YY');
  }
  function dateStamp(timestamp,gap) {
    if(!timestamp){
      return "";
    }
    const isoString = DataProcessor.domainTime(timestamp);
    let DATE2 = moment(isoString).format('YYYY-MM-DD HH:mm:ss');

    const isoString2 = DataProcessor.domainTime();
    const NOW2 = moment(isoString2).format('YYYY-MM-DD HH:mm:ss');

    const DIFF = moment(NOW2).diff(DATE2, 'day');
    if(DIFF < 1 && isTodayDomain(DATE2)){
      return "Today";
    } else if(DIFF < 2 ){
      return "Yesterday";
    }
    return moment(DATE2).format('DD MMM YY');
  }
  function clock(timestamp,gap) {
    const DATE = new Date(timestamp);
    return moment(DATE).format('DD-MMM-YY h:mm:ss a');
  }
  function timeago(timestamp) {
    const DATE = new Date(timestamp);
    let diff = Math.round((Date.now()-timestamp)/1000);
    if(diff < 60){
      return diff + ' sec';
    }
    return moment(DATE).fromNow(true);
  }

  var HOUR = 3600;
  var DAY = HOUR*24;
  var WEEK = DAY*7;
  function timespan (value) {
        if(value<60){
          return numeral(value).format("0.0") + ' sec';
        } else if(value<HOUR){
          return numeral(value/60).format("0.0") + ' min';
        } else if(value<DAY){
          return numeral(value/3600).format("0.0") + ' hrs';
        } else if(value<WEEK){
          return numeral(value/DAY).format("0.0") + ' days';
        } else if(value>=WEEK){
          return numeral(value/WEEK).format("0.0a") + ' wks';
        } 
        return moment(value).format("0.0").toLowerCase();//.replace(/(?:\r\n|\r|\n)/g, '<br/>').trim();
    }

  function hashCode(str) { // java String#hashCode
      str = str || '';
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
         hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  } 
  function intToRGB(i){
      var c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase();
      return "00000".substring(0, 6 - c.length) + c;
  }


  function phoneFormatted (value) {
    if(/^\d{10}$/.test(value))
      return true;

    if(/^[1-9]{1}[0-9]{3,14}$/.test(value))
      return true;

    //XXX-XXX-XXXX ,   XXX.XXX.XXXX,   XXX XXX XXXX
    if(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value))
      return true;
    //+XX-XXXX-XXXX,   +XX.XXXX.XXXX,   +XX XXXX XXXX
    if(/^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/.test(value))
      return true;

    // +111 (202) 555-0125
    if(/^(\+\d{1,3}( )?)?((\(\d{3}\))|\d{3})[- .]?\d{3}[- .]?\d{4}$/.test(value))
      return true;
    // 202 555 0125
    if(/^(\d{3}[- .]?){2}\d{4}$/.test(value))
      return true;
    //(202) 555-0125
    if(/^((\(\d{3}\))|\d{3})[- .]?\d{3}[- .]?\d{4}$/.test(value))
      return true;
    return false;
  }

var formatter = {
	instance : function (argument) {
	},
  addContactLabels : function (labels) {
    for(var i in labels){
      CONTACT_LABELS_DICT[labels[i].id] = labels[i];
    }
  },
  addContactTags : function (tags) {
    for(var i in tags){
      CONTACT_TAGS_DICT[tags[i].id] = tags[i];
    }
  },
  timespan : timespan,formatStamp : formatStamp, dateStamp : dateStamp,
  hexacode : function (str) {
    return intToRGB(hashCode(str));
  },
  contactLabels : function (id) {
    return (CONTACT_LABELS_DICT[id] || { id : id, title : id});
  },
  contactTags : function (id) {
    return (CONTACT_TAGS_DICT[id] || { id : id, title : id});
  },
  isEmpty : function (argument) {
    return argument === null ||argument === undefined || argument === "" || argument === "null";
  },
  nullify : function (argument) {
    if(argument === null ||argument === undefined || argument === "" || argument === "null"){
      return null;
    } return argument;
  },
  undify : function (argument) {
    if(argument === null ||argument === undefined || argument === "" || argument === "null"){
      return undefined;
    } return argument;
  },
  trim(string){
    if(typeof string == 'string'){
      return string.trim();
    } else return string;
  },
  ellipsis(text, maxLength){
    if (!maxLength || text.length <= maxLength) {
      return text; // No truncation needed
    }
    return text.slice(0, maxLength - 3) + '...';
  },
  any : function(){
    for(var i in arguments){
      if(arguments[i] !== undefined && arguments[i] !== null ){
        return arguments[i];
      }
    }
    return arguments[arguments.length-1];
  },
  toNum : function(num,def){
    let _def = def || 0;
    return ((isNaN(num) || !num) ? _def :  num)-0;
  },
  guid : function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
        + s4() + s4();
  },
  https : function (mediaUrl) {
    if(!mediaUrl) return mediaUrl;
    if(this.URL(mediaUrl) !== true){
      return mediaUrl;
    }
    let url = new URL(mediaUrl);
    if(url.hostname == '127.0.0.1'){
      return mediaUrl;
    }
    return mediaUrl.replace("http://","https://");
  },
  thumburl : function (mediaUrl,w,h) {
      let _w = w || '100', _h=h || '100';
      if(!mediaUrl) return mediaUrl;
      if(mediaUrl.indexOf('data:') == 0) return;
      var m = mediaUrl.match(/(.+)\/(res.cloudinary.com)\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9]+)\/(upload)\/([a-zA-Z0-9,_-]+)\/(.*)/);
      if(m && m.length){
        m[6] = `w_${_w},h_${_h}`;
        return m.slice(1).join("/");
      } 
      var aws = mediaUrl.match(/(.+)\/(.+).(s3.amazonaws.com)\/(.+)/);
      if(aws && aws.length){
        return `https://ik.imagekit.io/meherysoccom/${aws[2]}/${aws[4]}?tr=w-${_w},h-${_h}`
      } 
      return mediaUrl;
  },
  https_thumburl : function (mediaUrl,w,h) {
    return this.thumburl(this.https(mediaUrl),w,h);
  },
  stripslash : function (url) {
    return (url||"").replace(/\/+$/g,'').replace(/^\/+/,'');
  },
  clean_url : function(url){
    return url.replace(/(\/)\/+/g, "$1").replace(/^https?:/,'https:/');
  },
  toMedia(attachment){
    if(attachment){
      return {
        mediaCode : attachment.code,
        mediaSrc : null,
        mediaURL : attachment.url,
        mediaType : attachment.type || attachment.fileType,
        mediaSubType : null,
        mediaMimeType : attachment.mimeType || attachment.contentType, 
        mediaId : attachment.id,
        mediaName : attachment.title,
        mediaCaption : null,
        mediaTemplate : attachment.mediaTemplate || attachment.template,
      }
    } return null;
  },
  keys : function keys(map,prefix){
      prefix = prefix || "" ;
      var list = [];
      for(var key in map){
         if(typeof map[key] != 'object'){
          list.push(prefix + key);
         } else {
          list = list.concat(keys(map[key],prefix + key + "."));
         }
      }
      return list;
  },
  map_from_string : function (string) {
    var splitter_char = ";",  key_value_separator_char = ":";
    var map = {};
    return (string || "").split(splitter_char).reduce(function(total,currentValue) {
      var stub = (currentValue || "").split(key_value_separator_char);
      var key = (stub[0]||"").trim();
      if(key) total[key] = stub[1];
      return total;
    },{});
  },
  message_form_options : function (options) {
    var inputs = [];
    var buttons = [];

    Object.keys(options).map(function(key) {
        if (key.indexOf("form-input-") == 0) {
          var params = (options[key] || "").split("\\|");
          inputs.push({ 
              name : key.replace("form-input-", ""),
              label : params[0] || "",
              type : params[1] || ""
          });
        } else if (key.indexOf("actions-button-") == 0) {
          var params = (options[key] || "").split("\\|");
          buttons.push({ 
              name : key.replace("actions-button-", ""),
              label : params[0] || "",
              type : params[1] || ""
          });
        }
    });

    options["inputs"] = inputs;
    options["buttons"] = buttons;

    return options;
  },

  text_from_map : function(options){
    return Object.keys(options).map(function(key){
      return key + " : " + options[key];
    }).join("\n");
  },


  //Validators
  validators : ["phone","phoneML","emailz","alphanum","HBNumVar","HBPrefixedVar","URL","csvFile","oneline"],
  alphanum : function alphanumValidator (value) {
    if(/^[a-zA-Z0-9]*$/.test(value))
      return true
    return 'errors.ValidAlphaNum';
    //return true;
  },
  emailz : function emailValidator (value) {
    if(/^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}/.test(value))
      return true
    return 'errors.ValidEmail';
    //return true;
  },
  phone : function phoneValidator (value) {
    if(phoneFormatted(value)){
      return true;
    } 
    if(phoneFormatted(value.replace(/[\ \+]/g,""))){
      return true;
    } 
    return "errors.ValidPhone";
    //'Enter valid mobile number eg +91 XXXXX XXXXX';
  },
  phoneML : function phoneValidator (lineString) {
    var lines = lineString.match(/[^\r\n\,]+/g);
    for(var i in lines){
      if(lines[i] && !phoneFormatted(lines[i]) && !phoneFormatted(lines[i].replace(/[\ \+]/g,"")))
          return 'errors.ValidPhonesPerLine';
    }
    return true;
  },
  csvFile : function phoneValidator (file) {
    console.log("file",file, typeof file);
    return file.type === "text/csv";
  },
  HBPrefixedVar :  function(contents,values){
    values = values || [];
    let position = values[0];
    let min = values[1];
    let max = values[2];
    let prefixes = values.slice(3);
    var re = /({{([\w\d\.\_]+)}})/g;
    var vars = contents.match(re) || [];
    for(var v in vars){
      if(!prefixes.some(function(pref){
        return vars[v].indexOf("{{"+pref) == 0;
      })){
        return 'errors.InvalidVariable'; 
      }
    }
    return this.HBVar({contents,position,min,max,vars})
  },
  HBNumVar :  function(contents,[position,min,max]){
    var re = /({{([\w\d\.\_]+)}})/g;
    var vars = contents.match(re) || [];
    return  this.HBVar({contents,position,min,max,vars,ordered: true})
  },
  HBVar :  function({ contents,position,min,max,vars,ordered}){
    console.log("HBVar",vars);
    var myArray = vars
    if(min){
      min = parseInt(min);
      if(myArray.length<min)
        return 'errors.LessVariable';
    }
    if(max){
      max = parseInt(max);
      if(myArray.length>max){
        return 'errors.ExtraVariable';
      }
    }
    if(position == "end" && myArray.length){
      let totalLen = contents.length;
      let varStr = myArray[myArray.length-1];
      if(contents.indexOf(varStr) != (totalLen-varStr.length)){
        return 'errors.PositionVariable';
      }
    }
    if(ordered){
      for(let i=0;i<myArray.length; i++){
        console.log("HBVar","{{"+(i+1)+"}}" !== myArray[i])
        if("{{"+(i+1)+"}}" !== myArray[i]){
          return 'errors.InvalidVariableSeq';
        }
      }
    }
    return true;
  },
  URL : function(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return "errors.ValidURL";  
    }
    if(/\s/.test(string)){
      return "errors.ValidURL";
    }
    return (url.protocol === "http:" || url.protocol === "https:") && (url.href == string || url.origin == string);
  },
  oneline : function(contents){
    if(!/\n/.test(contents))
      return true
    return 'errors.ValidLine';
  },

  //Formmatter
  item_code : function item_code (value) {
    return (value || '').toLowerCase().trim().replace(/[^A-Za-z0-9_]+/g,'_').replace(/[_]+/g,'_');
  },
  alphanumlower : function alphanumlower (value) {
    return (value || '').toLowerCase().trim().replace(/[^A-Za-z0-9]+/g,'').replace(/[\s]+/g,'');
  },

  init : function () {
    var THAT = this;

    Vue.filter('formatDate', formatTime);
    Vue.filter('formatStamp', formatStamp);
    Vue.filter('dateStamp', dateStamp);
    Vue.filter('timeago', timeago);
    Vue.filter('clock', clock);
    
    Vue.filter('newlines', function (html_str) {
        return html_str.trim() ;//.replace(/(?:\r\n|\r|\n)/g, '<br/>').trim();
    });
    Vue.filter('lowercase', function (html_str) {
        return (html_str || '').toLowerCase()
    });
    Vue.filter('uppercase', function (html_str) {
      return (html_str || '').toUpperCase();
    });
    Vue.filter('nospacial', function (html_str) {
      return (html_str || '').replace(/[-_]/ig,' ');
    });
    Vue.filter('ellipsis', function (text,maxlength) {
      return THAT.ellipsis(text,maxlength);
    });
    Vue.filter('number', function (value,format) {
        var _format = format || "0,0a"
        return numeral(value).format(_format).toUpperCase();//.replace(/(?:\r\n|\r|\n)/g, '<br/>').trim();
    });
    Vue.filter('timespan', timespan);
    Vue.filter('striphtml', function (value) {
      var div = document.createElement("div");
      div.innerHTML = value;
      var text = div.textContent || div.innerText || "";
      return text;
    });
    Vue.filter('blank3dash', function (value) {
      return value || '---'
    });
    Vue.filter('stripslash', function (value) {
      return THAT.stripslash(value);
    });
    Vue.filter('https', function (mediaUrl) {
        return THAT.https(mediaUrl);
    });

    Vue.filter('thumburl', function (mediaUrl,w,h) {
        return THAT.thumburl(mediaUrl,w,h);
    });

    Vue.filter('display_lane', function (contact) {
      return Object.values(contact).filter((prop)=>{
        return !!prop?.lane;
      })[0]?.lane || contact.lane;
    });
    
    Vue.filter('contact_label', function (id) {
        return THAT.contactLabels(id).title;
    });

    Vue.filter('contact_tag', function (id) {
        return THAT.contactTags(id).title;
    });

    Vue.filter('contact_tag', function (id) {
      return THAT.contactTags(id).title;
  });

    Vue.filter('display', function (value,options,key) {
      if(typeof options == "string"){
        var map = formatter.map_from_string(options);
        return map[value];
      }
      var option = ((options||[]).filter((option) => (option.value == value))[0])||{};
      if(option && option.label !== undefined && option.label !== null){
        return option.label;
      }
      return value;
    });

    Vue.filter('log_option', function (id,event_type) {
        switch(event_type){
          case 'LABEL_ADDED':
          case 'LABEL_REMOVED':
            return THAT.contactLabels(id).title;
          case 'TAG_ADDED':
          case 'TAG_REMOVED':
            return THAT.contactTags(id).title;
          default:
            return id;
        }
    });

    Vue.filter('hexacode', function (str) {
        return THAT.hexacode(str);
    });
    Vue.filter('json', function (str) {
      return JSON.stringify(JsonUtils.deepParse(str), null, 2);
    });
    Vue.filter('md', function (str) {
      return marked.parse(str || "");
    });
    Vue.filter('hb', function (str,model) {
      try {
        return mustache.render(str, model);
      } catch(e){
        return str;
      }
    });

    Vue.filter('item_code', THAT.item_code);
    Vue.filter('alphanumlower', THAT.alphanumlower);
  }
}

formatter.init();
Vue.prototype.$formatters = formatter;
Vue.prototype.$f = formatter;
export default formatter;