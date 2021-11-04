function trimBoth(str) {
  return jQuery.trim(str);
}

function setAllDependancyFieldsMapping() {
  var mapDependancyLabels = getMapDependenySelectValues(jQuery("[id='property(module)']").val(), "JSON_MAP_DEP_LABELS");
  if (mapDependancyLabels) {
    for (var i = 0; i < mapDependancyLabels.length; i++) {
      var label = mapDependancyLabels[i];
      var obj = document.forms['zsWebToCase_638510000000180873'][label];
      if (obj) {
        setDependent(obj, true);
      }
    }
  }
}

function getMapDependenySelectValues(module, key) {
  var dependencyObj = jQuery.parseJSON(jQuery("[id='dependent_field_values_" + module + "']").val());
  if (dependencyObj == undefined) {
    return dependencyObj;
  }
  return dependencyObj[key];
}

function setDependent(obj, isload) {
  var name = obj.id || (obj[0] && obj[0].id) || "";
  var module = jQuery("[id='property(module)']").val();
  var val = "";
  var myObject = getMapDependenySelectValues(module, "JSON_VALUES");
  if (myObject != undefined) {
    val = myObject[name];
  }
  var mySelObject = getMapDependenySelectValues(module, "JSON_SELECT_VALUES");
  if (val != null && val != "" && val != "null" && mySelObject) {
    var fields = val;
    for (var i in fields) {
      if (fields.hasOwnProperty(i)) {
        var isDependent = false;
        var label = i;
        var values = fields[i];
        if (label.indexOf(")") > -1) {
          label = label.replace(/\)/g, '_____');
        }
        if (label.indexOf("(") > -1) {
          label = label.replace(/\(/g, '____');
        }
        if (label.indexOf(".") > -1) {
          label = label.replace(/\./g, '___');
        }
        var depObj = document.forms['zsWebToCase_638510000000180873'][label];
        if (depObj && depObj.options) {
          var mapValues = "";
          var selected_val = depObj.value;
          var depLen = depObj.options.length - 1;
          for (var n = depLen; n >= 0; n--) {
            if (depObj.options[n].selected) {
              if (mapValues == "") {
                mapValues = depObj.options[n].value;
              } else {
                mapValues = mapValues + ";;;" + depObj.options[n].value;
              }
            }
          }
          depObj.value = "";
          var selectValues = mySelObject[label];
          for (var k in values) {
            var rat = k;
            if (rat == "-None-") {
              rat = "";
            }
            var parentValues = mySelObject[name];
            if (rat == trimBoth(obj.value)) {
              isDependent = true;
              depObj.length = 0;
              var depvalues = values[k];
              var depLen = depvalues.length - 1;
              for (var j = 0; j <= depLen; j++) {
                var optionElement = document.createElement("OPTION");
                var displayValue = depvalues[j];
                var actualValue = displayValue;
                if (actualValue == "-None-") {
                  optionElement.value = "";
                  displayValue = "-None-";
                } else {
                  optionElement.value = actualValue;
                }
                optionElement.text = displayValue;
                if (mapValues != undefined) {
                  var mapValue = mapValues.split(";;;");
                  var len = mapValue.length;
                  for (var p = 0; p < len; p++) {
                    if (actualValue == mapValue[p]) {
                      optionElement.selected = true;
                    }
                  }
                }
                depObj.options.add(optionElement);
              }
            }
          }
          if (!isDependent) {
            depObj.length = 0;
            var len = selectValues.length;
            for (var j = 0; j < len; j++) {
              var actualValue = selectValues[j];
              var optionElement = document.createElement("OPTION");
              if (actualValue == "-None-") {
                optionElement.value = "";
              } else {
                optionElement.value = selectValues[j];
              }
              optionElement.text = selectValues[j];
              depObj.options.add(optionElement);
            }
            depObj.value = selected_val;
          }
          if (!isload) {
            setDependent(depObj, false);
          }
          var jdepObj = jQuery(depObj);
          if (jdepObj.hasClass('select2-offscreen')) {
            jdepObj.select2("val", jdepObj.val());
          }
        }
      }
    }
  }
}

var zctt = function () {
  var tt, mw = 400, top = 10, left = 0, doctt = document;
  var ieb = doctt.all ? true : false;
  return {
    showtt: function (cont, wid) {
      if (tt == null) {
        tt = doctt.createElement('div');
        tt.setAttribute('id', 'tooltip-zc');
        doctt.body.appendChild(tt);
        doctt.onmousemove = this.setpos;
        doctt.onclick = this.hidett;
      }
      tt.style.display = 'block';
      tt.innerHTML = cont;
      tt.style.width = wid ? wid + 'px' : 'auto';
      if (!wid && ieb) {
        tt.style.width = tt.offsetWidth;
      }
      if (tt.offsetWidth > mw) {
        tt.style.width = mw + 'px'
      }
      h = parseInt(tt.offsetHeight) + top;
      w = parseInt(tt.offsetWidth) + left;
    }, hidett: function () {
      tt.style.display = 'none';
    }, setpos: function (e) {
      var u = ieb ? event.clientY + doctt.body.scrollTop : e.pageY;
      var l = ieb ? event.clientX + doctt.body.scrollLeft : e.pageX;
      var cw = doctt.body.clientWidth;
      var ch = doctt.body.clientHeight;
      if (l < 0) {
        tt.style.left = left + 'px';
        tt.style.right = '';
      } else if ((l + w + left) > cw) {
        tt.style.left = '';
        tt.style.right = ((cw - l) + left) + 'px';
      } else {
        tt.style.right = '';
        tt.style.left = (l + left) + 'px';
      }
      if (u < 0) {
        tt.style.top = top + 'px';
        tt.style.bottom = '';
      } else if ((u + h + left) > ch) {
        tt.style.top = '';
        tt.style.bottom = ((ch - u) + top) + 'px';
      } else {
        tt.style.bottom = '';
        tt.style.top = (u + top) + 'px';
      }
    }
  };
}();
var zsWebFormMandatoryFields = new Array("Contact Name", "Email", "Subject");
var zsFieldsDisplayLabelArray = new Array("Last Name", "Email", "Subject");

function zsValidateMandatoryFields() {
  var name = '';
  var email = '';
  var isError = 0;
  for (var index = 0; index < zsWebFormMandatoryFields.length; index++) {
    isError = 0;
    var fieldObject = document.forms['zsWebToCase_638510000000180873'][zsWebFormMandatoryFields[index]];
    if (fieldObject) {
      if (((fieldObject.value).replace(/^\s+|\s+$/g, '')).length == 0) {
        alert(zsFieldsDisplayLabelArray[index] + ' cannot be empty ');
        fieldObject.focus();
        isError = 1;
        return false;
      } else {
        if (fieldObject.name == 'Email') {
          if (!fieldObject.value.match(/^([\w_][\w\-_.+\'&]*)@(?=.{4,256}$)(([\w]+)([\-_]*[\w])*[\.])+[a-zA-Z]{2,22}$/)) {
            isError = 1;
            alert('Enter a valid email-Id');
            fieldObject.focus();
            return false;
          }
        }
      }
      if (fieldObject.nodeName == 'SELECT') {
        if (fieldObject.options[fieldObject.selectedIndex].value == '-None-') {
          alert(zsFieldsDisplayLabelArray[index] + ' cannot be none');
          fieldObject.focus();
          isError = 1;
          return false;
        }
      }
      if (fieldObject.type == 'checkbox') {
        if (fieldObject.checked == false) {
          alert('Please accept ' + zsFieldsDisplayLabelArray[index]);
          fieldObject.focus();
          isError = 1;
          return false;
        }
      }
    }
  }
  if (isError == 0) {
    if (document.forms['zsWebToCase_638510000000180873']['zsWebFormCaptchaWord'].value.replace(/^\s+|\s+$/g, '').length == 0) {
      alert('Please enter the captcha code.');
      document.forms['zsWebToCase_638510000000180873']['zsWebFormCaptchaWord'].focus();
      return false;
    }
  }
  if (isError == 0) {
    document.getElementById('zsSubmitButton_638510000000180873').setAttribute('disabled', 'disabled');
  }
}

var ZSEncoder = {
  encodeForHTML: function (str) {
    if (str && typeof (str) === 'string') {
      return jQuery.encoder.encodeForHTML(str);
    }
    return str;
  }, encodeForHTMLAttribute: function (str) {
    if (str && typeof (str) === 'string') {
      return jQuery.encoder.encodeForHTMLAttribute(str);
    }
    return str;
  }, encodeForJavascript: function (str) {
    if (str && typeof (str) === 'string') {
      return jQuery.encoder.encodeForJavascript(str);
    }
    return str;
  }, encodeForCSS: function (str) {
    if (str && typeof (str) === 'string') {
      return jQuery.encoder.encodeForCSS(str);
    }
    return str;
  }
};
var zsAttachedAttachmentsCount = 0;
var zsAllowedAttachmentLimit = 4;
var zsAttachmentFileBrowserIdsList = [1, 2, 3, 4, 5];

function zsOpenCloudPickerIframe() {
  if (zsAttachedAttachmentsCount < 5) {
    var zsCloudPickerIframeSrc = jQuery('#zsCloudPickerIframeSrc').val();
    jQuery('#zsCloudAttachmentIframe').attr('src', zsCloudPickerIframeSrc.substring(0, zsCloudPickerIframeSrc.length - 1) + (5 - zsAttachedAttachmentsCount)).show();
    zsListenCloudPickerMessages();
  }
}

function zsListenCloudPickerMessages() {
  if (window.addEventListener) {
    window.addEventListener('message', zsWebReceiveMessage, false);
  } else if (window.attachEvent) {
    window.attachEvent('onmessage', zsWebReceiveMessage);
  }
}

var zsCloudPickerJSON = {};

function zsWebReceiveMessage(event) {
  var zsUrlRegex = /^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\:\'\/\\+=&amp;%\$#_]*)?$/;
  if (zsUrlRegex.test(event.origin)) {
    var zsMessageType = event.data.split('&&&');
    if (zsMessageType[0] == 'zsCloudPickerMessage') {
      if (window.addEventListener) {
        window.removeEventListener('message', zsWebReceiveMessage, false);
      } else if (window.attachEvent) {
        window.detachEvent('onmessage', zsWebReceiveMessage);
      }
      jQuery('#zsCloudAttachmentIframe').hide();
      var isAttachedFilesDetails = zsMessageType[1].split('|||');
      if (isAttachedFilesDetails[0] == 'cloudPickerResponse') {
        var zsCloudPickerAttachmentDetails = isAttachedFilesDetails[1].split('::::');
        var zsCloudPickerAttachmentsJSON = jQuery.parseJSON(zsCloudPickerAttachmentDetails[0]);
        if (zsAttachedAttachmentsCount <= zsAllowedAttachmentLimit) {
          zsRenderCloudAttachments(zsCloudPickerAttachmentsJSON);
        } else {
          alert('You cannot attach more than 5 files');
          return false;
        }
      }
    }
  }
}

function zsRenderCloudAttachments(zsCloudPickerAttachmentsJSON) {
  if (!jQuery.isEmptyObject(zsCloudPickerAttachmentsJSON)) {
    jQuery.each(zsCloudPickerAttachmentsJSON, function (cloudServiceName, attachments) {
      var zsAttachmentsArray = [];
      if (!jQuery.isEmptyObject(zsCloudPickerJSON[cloudServiceName])) {
        zsAttachmentsArray = zsCloudPickerJSON[cloudServiceName];
      }
      for (var attachmentsIndex = 0; attachmentsIndex < attachments.length; attachmentsIndex++) {
        if (zsAttachedAttachmentsCount <= zsAllowedAttachmentLimit) {
          var zsCloudAttachmentsList = '';
          var attachmentsDetailJSON = attachments[attachmentsIndex];
          var zsCloudAttachmentName = attachmentsDetailJSON['docName'];
          var extension = zsCloudAttachmentName.split('.').pop().toLowerCase();
          var unSupportedExtensions = ["ade", "adp", "apk", "appx", "appxbundle", "bat", "cab", "cer", "chm", "cmd", "com", "cpl", "dll", "dmg", "exe", "hlp", "hta", "ins", "iso", "isp", "jar", "js", "jse", "lnk", "mde", "msc", "msi", "msix", "msixbundle", "msp", "mst", "nsh", "pif", "ps1", "pst", "reg", "scr", "sct", "shb", "sys", "tmp", "url", "vb", "vbe", "vbs", "vxd", "wsc", "wsf", "wsh", "terminal"];
          if (unSupportedExtensions.indexOf(extension) != -1) {
            alert("The file wasn't attached since its extension is not supported.");
            continue;
          }
          zsAttachedAttachmentsCount = zsAttachedAttachmentsCount + 1;
          var zsCloudAttachmentId = attachmentsDetailJSON['docId'];
          zsCloudAttachmentId = zsCloudAttachmentId.replace(/\s/g, '');
          zsCloudAttachmentsList = '<div class="filenamecls zsFontClass">' + ZSEncoder.encodeForHTML(zsCloudAttachmentName) + '<a id="' + ZSEncoder.encodeForHTMLAttribute(zsCloudAttachmentId) + '" cloudservice="' + ZSEncoder.encodeForHTMLAttribute(cloudServiceName) + '" class="zscloudAttachment" style="margin-left:10px;" href="javascript:;">X</a> </div>';
          jQuery('#zsFileBrowseAttachments').append(zsCloudAttachmentsList);
          zsAttachmentsArray.push(attachmentsDetailJSON);
          zsCloudPickerJSON[cloudServiceName] = zsAttachmentsArray;
          jQuery("input[name='zsCloudPickerAttachments']")[0].value = JSON.stringify(zsCloudPickerJSON);
        }
      }
    });
  }
  zsChangeMousePointer();
}

jQuery(document).off('click.cAtm').on('click.cAtm', '.zscloudAttachment', function () {
  var cloudService = jQuery(this).attr('cloudservice');
  var cloudAttachmentId = jQuery(this).attr('id');
  var zsCloudAttachmentsArr = zsCloudPickerJSON[cloudService];
  var isZsCloudAttachmentRemoved = 0;
  for (var attachmentsIndex = 0; attachmentsIndex < zsCloudAttachmentsArr.length; attachmentsIndex++) {
    if (isZsCloudAttachmentRemoved != 1) {
      jQuery.each(zsCloudAttachmentsArr[attachmentsIndex], function (attachmentsDetailJsonKey, attachmentsDetailJsonValue) {
        if (attachmentsDetailJsonKey == 'docId' && attachmentsDetailJsonValue.replace(/\s/g, '') == cloudAttachmentId) {
          var zsAttachmentToBeRemoved = jQuery.inArray(zsCloudAttachmentsArr[attachmentsIndex], zsCloudAttachmentsArr);
          zsCloudAttachmentsArr.splice(zsAttachmentToBeRemoved, 1);
          isZsCloudAttachmentRemoved = 1;
        }
      });
    }
  }
  jQuery(this).parent().remove();
  zsAttachedAttachmentsCount = zsAttachedAttachmentsCount - 1;
  jQuery("input[name='zsCloudPickerAttachments']")[0].value = JSON.stringify(zsCloudPickerJSON);
  zsChangeMousePointer();
});

function zsRenderBrowseFileAttachment(zsAttachmentObject, zsAttachmentDetails) {
  if (zsAttachmentObject != '') {
    if ((zsAttachmentDetails.files && (zsAttachmentDetails.files[0].size / (1024 * 1024)) > 20)) {
      zsAttachmentDetails.value = '';
      alert('Maximum allowed file size is 20MB.');
      return;
    }
    if (zsAttachedAttachmentsCount < 5) {
      var zsFileName = '';
      if ((zsAttachmentObject.indexOf('\\') > -1)) {
        var zsAttachmentDataSplits = zsAttachmentObject.split('\\');
        var zsAttachmentDataSplitsLen = zsAttachmentDataSplits.length;
        zsFileName = zsAttachmentDataSplits[zsAttachmentDataSplitsLen - 1];
      } else {
        zsFileName = zsAttachmentObject;
      }
      var extension = zsFileName.split('.').pop().toLowerCase();
      var unSupportedExtensions = ["ade", "adp", "apk", "appx", "appxbundle", "bat", "cab", "cer", "chm", "cmd", "com", "cpl", "dll", "dmg", "exe", "hlp", "hta", "ins", "iso", "isp", "jar", "js", "jse", "lnk", "mde", "msc", "msi", "msix", "msixbundle", "msp", "mst", "nsh", "pif", "ps1", "pst", "reg", "scr", "sct", "shb", "sys", "tmp", "url", "vb", "vbe", "vbs", "vxd", "wsc", "wsf", "wsh", "terminal"];
      if (unSupportedExtensions.indexOf(extension) != -1) {
        alert("The file wasn't attached since its extension is not supported.");
        return;
      }
      var zsCurrentAttachmentIdTokens = jQuery(zsAttachmentDetails).attr('id').split('_');
      var zsCurrentAttachmentId = parseInt(zsCurrentAttachmentIdTokens[1]);
      var zsAttachmentIdToBeRemoved = jQuery.inArray(zsCurrentAttachmentId, zsAttachmentFileBrowserIdsList);
      zsAttachmentFileBrowserIdsList.splice(zsAttachmentIdToBeRemoved, 1);
      var zsNextAttachmentId = zsAttachmentFileBrowserIdsList[0];
      var zsnextAttachment = 'zsattachment_' + zsNextAttachmentId;
      jQuery('#zsattachment_' + zsCurrentAttachmentId).hide();
      jQuery('#' + zsnextAttachment).show();
      jQuery('#zsFileBrowseAttachments').append('<div class="filenamecls zsFontClass" id="file_' + zsCurrentAttachmentId + '">' + ZSEncoder.encodeForHTML(zsFileName) + '<a class="zsfilebrowseAttachment" style="margin-left:10px;" href="javascript:;" id="fileclose_' + zsCurrentAttachmentId + '">X</a></div>');
      zsAttachedAttachmentsCount = zsAttachedAttachmentsCount + 1;
    }
  }
  zsChangeMousePointer();
}

jQuery(document).off('click.fba').on('click.fba', '.zsfilebrowseAttachment', function () {
  var currentlyDeletedElement = jQuery(this).attr('id').split('_')[1];
  jQuery('#zsattachment_' + currentlyDeletedElement).val('');
  jQuery('#zsattachment_' + currentlyDeletedElement).replaceWith(jQuery('#zsattachment_' + currentlyDeletedElement).clone());
  jQuery(this).parent().remove();
  zsAttachedAttachmentsCount = zsAttachedAttachmentsCount - 1;
  zsAttachmentFileBrowserIdsList.push(parseInt(currentlyDeletedElement));
  zsRearrangeFileBrowseAttachments();
  zsChangeMousePointer();
});

function zsRearrangeFileBrowseAttachments() {
  jQuery.each(jQuery('input[type = file]'), function (fileIndex, fileObject) {
    fileIndex = fileIndex + 1;
    if (fileIndex == zsAttachmentFileBrowserIdsList[0]) {
      jQuery('#zsattachment_' + fileIndex).show();
    } else {
      jQuery('#zsattachment_' + fileIndex).hide();
    }
  });
}

function zsOpenFileBrowseAttachment(clickEvent) {
  if (zsAttachedAttachmentsCount >= 5) {
    clickEvent.preventDefault();
  }
}

function zsChangeMousePointer() {
  if (zsAttachedAttachmentsCount >= 5) {
    jQuery('#zsMaxLimitMessage').show();
    jQuery('#zsattachment_1,#zsattachment_2,#zsattachment_3,#zsattachment_4,#zsattachment_5').hide();
    jQuery('#zsBrowseAttachment,#zsCloudAttachment').css('cursor', 'default');
  } else {
    jQuery('#zsMaxLimitMessage').hide();
    zsRearrangeFileBrowseAttachments();
    jQuery('#zsBrowseAttachment,#zsCloudAttachment').css('cursor', 'pointer');
  }
}

function zsShowCaptcha() {
  jQuery('#zsCaptchaLoading').hide();
  jQuery('#zsCaptcha').show().css('display','inline-flex');
}

function zsRegenerateCaptcha() {
  var webFormxhr = {};
  webFormxhr = new XMLHttpRequest();
  webFormxhr.open('GET', 'https://desk.zoho.com/support/GenerateCaptcha?action=getNewCaptcha&_=' + new Date().getTime(), true);
  webFormxhr.onreadystatechange = function () {
    if (webFormxhr.readyState === 4 && webFormxhr.status === 200) {
      try {
        var response = (webFormxhr.responseText != null) ? JSON.parse(webFormxhr.responseText) : '';
        jQuery('#zsCaptchaUrl').load(zsShowCaptcha);
        document.getElementById('zsCaptchaUrl').src = response.captchaUrl;
        document.getElementsByName('xJdfEaS')[0].value = response.captchaDigest;
      } catch (e) {
      }
    }
  };
  webFormxhr.send();
}


function zsResetWebForm(webFormId) {
  document.forms['zsWebToCase_' + webFormId].reset();
  document.getElementById('zsSubmitButton_638510000000180873').removeAttribute('disabled');
  setAllDependancyFieldsMapping();
  zsAttachedAttachmentsCount = 0;
  zsAttachmentFileBrowserIdsList = [1, 2, 3, 4, 5];
  jQuery('#zsFileBrowseAttachments').html('');
  zsCloudPickerJSON = {};
  if (document.forms['zsWebToCase_638510000000180873']['zsCloudPickerAttachments'] != undefined) {
    document.forms['zsWebToCase_638510000000180873']['zsCloudPickerAttachments'].value = JSON.stringify({});
  }
  zsRearrangeFileBrowseAttachments();
  zsChangeMousePointer();
}

window.__renderReportCall__ = function (){
  // function () {
  //   if (document.readyState === 'complete' && window.zsRegenerateCaptcha) {
    zsRegenerateCaptcha();
    // }
    setAllDependancyFieldsMapping();
    document.getElementById('zsSubmitButton_638510000000180873').removeAttribute('disabled');
    zsAttachedAttachmentsCount = 0;
    zsAttachmentFileBrowserIdsList = [1, 2, 3, 4, 5];
    document.forms['zsWebToCase_638510000000180873']['zsWebFormCaptchaWord'].value = '';
    jQuery('#zsFileBrowseAttachments').html('');
    jQuery.each(jQuery('input[type = file]'), function (fileIndex, fileObject) {
      var zsAttachmentId = jQuery(fileObject).attr('id');
      var zsAttachmentNo = zsAttachmentId.split('_')[1];
      var zsAttachedFile = jQuery('#zsattachment_' + zsAttachmentNo);
      if (zsAttachedFile[0] != undefined && zsAttachedFile[0].files[0] != undefined) {
        var zsFileBrowserAttachmentHtml = '';
        zsAttachedFileName = zsAttachedFile[0].files[0].name;
        zsFileBrowserAttachmentHtml = '<div class="filenamecls zsFontClass" id="file_' + zsAttachmentNo + '">' + ZSEncoder.encodeForHTML(zsAttachedFileName) + '<a class="zsfilebrowseAttachment" style="margin-left:10px" href="javascript:;" id="fileclose_' + zsAttachmentNo + '">X</a></div>';
        jQuery('#zsFileBrowseAttachments').append(zsFileBrowserAttachmentHtml);
        zsAttachedAttachmentsCount = zsAttachedAttachmentsCount + 1;
        var zsAttachmentIdToBeRemoved = jQuery.inArray(parseInt(zsAttachmentNo), zsAttachmentFileBrowserIdsList);
        zsAttachmentFileBrowserIdsList.splice(zsAttachmentIdToBeRemoved, 1);
      }
    });
    if (document.forms['zsWebToCase_638510000000180873']['zsCloudPickerAttachments'] != undefined) {
      var zsCloudAttachments = jQuery.parseJSON(document.forms['zsWebToCase_638510000000180873']['zsCloudPickerAttachments'].value);
      zsRenderCloudAttachments(zsCloudAttachments);
    }
    zsRearrangeFileBrowseAttachments();
    zsChangeMousePointer();
  // }
}