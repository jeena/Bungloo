
(function ($) {
    $.format = (function () {

		var parseMonth = function(value){
			           
    		switch(value){
    		case "Jan":
    			return "01"; 
        		break;
    		case "Feb":
    			return "02";  
        		break;
    		case "Mar":
    			return "03";  
        		break;	      
    		case "Apr":
    			return "04";  
        		break;	      
    		case "May":
    			return "05";  
        		break;	      
    		case "Jun":
    			return "06";  
        		break;	      
    		case "Jul":
    			return "07";  
        		break;	      
    		case "Aug":
    			return "08";  
        		break;
    		case "Sep":
    			return "09";  
        		break;	 
    		case "Oct":
    			return "10";  
        		break;	 
    		case "Nov":
    			return "11";  
        		break;	 
    		case "Dec":
    			return "12";  
        		break;	         		        		        		        			              		        		        		        		        		
			default:
				return value;
			}  
		};
		
		var parseTime = function(value){
			var retValue = value;
			if(retValue.indexOf(".") != -1){
				retValue =  retValue.substring(0, retValue.indexOf("."));
			}
			
    		var values3 = retValue.split(":");
    		
    		if(values3.length == 3){
	    		hour		= values3[0]; 
	    		minute		= values3[1];
	    		second		= values3[2];
				
				return {
						time: retValue,
						hour: hour,
						minute: minute,
						second: second
				};
    		} else {
				return {
					time: "",
					hour: "",
					minute: "",
					second: ""
			};    			
    		}
		};
        
        return {
            date: function(value, format){
            	//value = new java.util.Date()
        		//2009-12-18 10:54:50.546
            	try{
            		var values = value.split(" ");
            		var year 		= null;
            		var month 		= null;
            		var dayOfMonth 	= null;
            		var time 		= null; //json, time, hour, minute, second
            		
            		switch(values.length){
            		case 6://Wed Jan 13 10:43:41 CET 2010
            			year 		= values[5];            			
	            		month 		= parseMonth(values[1]);
	            		dayOfMonth 	= values[2];
	            		time		= parseTime(values[3]);
            			break;
            		case 2://2009-12-18 10:54:50.546
            			var values2 = values[0].split("-");
            			year 		= values2[0];               			
            			month 		= values2[1];
	            		dayOfMonth 	= values2[2];
	            		time 		= parseTime(values[1]);
            			break;
            		default:
            			return value;
            		}
            		
            		
            		var pattern 	= "";
            		var retValue 	= "";
            		
            		for(i = 0; i < format.length; i++){
            			var currentPattern = format.charAt(i);
            			pattern += currentPattern;
            			switch(pattern){
                		case "dd":
                			retValue += dayOfMonth;
                			pattern   = "";
    	            		break;
                		case "MM":
                			retValue += month;
                			pattern   = "";
    	            		break;	            		
                		case "yyyy":
                			retValue += year;
                			pattern   = "";
    	            		break;
                		case "HH":
                			retValue += time.hour;
                			pattern   = "";
    	            		break;    	            		
                		case "hh":
                			retValue += time.hour;
                			pattern   = "";
    	            		break;
                		case "mm":
                			retValue += time.minute;
                			pattern   = "";
    	            		break;
                		case "ss":
                			retValue += time.second;
                			pattern   = "";
    	            		break;
                		case " ":
                			retValue += currentPattern;
                			pattern   = "";
    	            		break;
                		case "/":
                			retValue += currentPattern;
                			pattern   = "";
    	            		break;    	            	
                		case ":":
                			retValue += currentPattern;
                			pattern   = "";
    	            		break;    	            	    	            		
            			default:
            				if(pattern.length == 2 && pattern.indexOf("y") != 0){
            					retValue += pattern.substring(0, 1);
            					pattern = pattern.substring(1, 2);
            				} else if((pattern.length == 3 && pattern.indexOf("yyy") == -1)){
            					pattern   = "";
            				}
            			}            
                    }
            		return retValue;
            	} catch(e) {
                	return value;
            	}	
        	}
        };
    })();
}(jQuery));


$(document).ready(function() {
    $(".shortDateFormat").each(function(idx, elem) {
        if ($(elem).is(":input")){
            $(elem).val($.format.date($(elem).val(), 'dd/MM/yyyy'));
        } else {
            $(elem).text($.format.date($(elem).text(), 'dd/MM/yyyy'));
        }
    });   
    $(".longDateFormat").each(function(idx, elem) {
        if ($(elem).is(":input")){
            $(elem).val($.format.date($(elem).val(), 'dd/MM/yyyy hh:mm:ss'));
        } else {
            $(elem).text($.format.date($(elem).text(), 'dd/MM/yyyy hh:mm:ss'));
        }
    });   
});

/*
 * timeago: a jQuery plugin, version: 0.8.2 (2010-02-16)
 * @requires jQuery v1.2.3 or later
 *
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2008-2010, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
(function($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) return inWords(timestamp);
    else if (typeof timestamp == "string") return inWords($.timeago.parse(timestamp));
    else return inWords($.timeago.datetime(timestamp));
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowFuture: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        ago: null, // DEPRECATED, use suffixAgo
        fromNow: null, // DEPRECATED, use suffixFromNow
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
      }
    },
    inWords: function(distanceMillis) {
      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo || $l.ago;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow || $l.fromNow;
        }
        distanceMillis = Math.abs(distanceMillis);
      }

      var seconds = distanceMillis / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 48 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.floor(days)) ||
        days < 60 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.floor(days / 30)) ||
        years < 2 && substitute($l.year, 1) ||
        substitute($l.years, Math.floor(years));

      return $.trim([prefix, words, suffix].join(" "));
    },
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    datetime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      var isTime = $(elem).get(0).tagName.toLowerCase() == "time"; // $(elem).is("time");
      var iso8601 = isTime ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    }
  });

  $.fn.timeago = function() {
    var self = this;
    self.each(refresh);

    var $s = $t.settings;
    if ($s.refreshMillis > 0) {
      setInterval(function() { self.each(refresh); }, $s.refreshMillis);
    }
    return self;
  };

  function refresh() {
    var data = prepareData(this);
    if (!isNaN(data.datetime)) {
      $(this).text(inWords(data.datetime));
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if (text.length > 0) element.attr("title", text);
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  function substitute(stringOrFunction, value) {
    var string = $.isFunction(stringOrFunction) ? stringOrFunction(value) : stringOrFunction;
    return string.replace(/%d/i, value);
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
})(jQuery);
