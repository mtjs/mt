/**
 * Created with JetBrains WebStorm.
 * User: waynelu
 * Date: 14-7-18
 * Time: 下午3:54
 * To change this template use File | Settings | File Templates.
 */
var cDiff = require('./chunkDiff.js');
var lDiff= require('./lcsDiff.js');
/**
 * 编辑距离算法
 * @param source
 * @param target
 * @return
 */
function getDiffEncode(start,oldContentStr,newContentStr){
    var jsonArray=lcsdiff(oldContentStr,newContentStr);

    for(var i=0;i<jsonArray.length;i++){
        var jObj=jsonArray[i];
        if(typeof(jObj)=="object" &&jObj.length>0){
            jObj[0]=jObj[0]+start;
        }
    }
    if(jsonArray.length==0){
        var tempArray=new Array();
        tempArray.add(start+1);
        tempArray.add(oldContentStr.length);
        jsonArray.add(tempArray);
    }
    return jsonArray;
}
function lcsdiff(source,target){
    //System.out.println("lcsdiff:   "+source+" ||||| "+target );
    return lDiff.getDiff(source, target);
}
/**
 *
 * @param source
 * @param target
 * @param chunkSize
 * @return
 */
 function chunkDiff(source,target,chunkSize){
    var json=cDiff.getDiff(source, target, chunkSize);
   // console.log(json);
    return json;

}
function getLcsStrByChunk(initStart,source,target,minLen){
    var dataArray=chunkDiff(source,target,12);
    var lcsStrItem={},lcsPosInit=new Array();
    lcsPosInit.push(-1);
    lcsPosInit.push(-1);
    lcsStrItem.lcsPos=lcsPosInit;
    var maxLen=0;
    for(var i=0;i<dataArray.length;i++){
        var jObj=dataArray[i];
        if(typeof(jObj)=="object" ){
            var len=jObj[1]*12;
            var start=jObj[0]*12;
            var end=start+len;
            if(len>=minLen&&len>maxLen){
                var lcsPos=new Array();
                lcsPos.push(start+1+initStart);
                lcsPos.push(len);

                var lcsStr=source.substring(start, end);
                lcsStrItem.srcPre=source.substring(0,start);
                lcsStrItem.srcNext=source.substring(end,source.length);
                lcsStrItem.lcsPos=lcsPos;
                //System.out.println(lcsStr);
                var tarStart=target.indexOf(lcsStr);
                var tarEnd=tarStart+lcsStr.length;
                lcsStrItem.tarPre=target.substring(0,tarStart);
                lcsStrItem.tarNext=target.substring(tarEnd,target.length);
                maxLen=len;
            }
        }
    }

    return lcsStrItem;
}
function merge(oldContent,incData){
    var reContent="";
    var dataArray=incData;
    for(var i=0;i<dataArray.length;i++){
        if(typeof(jObj)=="object" ){
            var start=jObj[0]-1;
            var len=jObj[1];
            //System.out.println("merge lcs:"+oldContent.substring(start,start+len));
            reContent+=oldContent.substring(start,start+len);

        }
        else{
            //System.out.println("merge modify:"+jObj.toString());
            reContent+=jObj;
        }
    }

    return reContent;
}
function addMerge(strDataArray,addArry){
    console.log(strDataArray+" "+addArry);
    if(strDataArray.length==0||strDataArray[0].length==0){
        return addArry;

    }
    if(addArry.length==0||addArry[0].length==0){
        return strDataArray;

    }
    var jObj=strDataArray[strDataArray.length-1];
    var addObj=addArry[0];
    if((typeof(jObj)=="object" )&&(typeof(addObj)=="object" )){
       // JSONArray jsonObj=(JSONArray)jObj;
       // JSONArray addArrayObj=(JSONArray)addObj;
        if(jObj[0]+jObj[1]==addObj[0]){
            jObj[1]=jObj[1]+addObj[1];
            if(addArry.length>1){
                return strDataArray.concat(addArry.slice(1,addArry.length)) ;
            }
            else{
                return strDataArray;
            }


        }
        else{
            return strDataArray.concat(addArry);
        }
    }
    else{
        return strDataArray.concat(addArry);
    }
}

function mixDiff(start,source,target,lcsMaxLen){
   console.log("mixDiff:"+source+" "+target);
    var minLen=12;
    var sourceLen=source.length;
    var targetLen=target.length;
    var reArray=new Array();
    //如果是
    if(sourceLen*targetLen<lcsMaxLen*lcsMaxLen){
//			System.out.println(start);
//			System.out.println(source);
//			System.out.println(target);
        return getDiffEncode(start,source,target);
    }
    var lcsStrItem=getLcsStrByChunk(start,source, target, minLen);
    console.log(lcsStrItem);
    if(lcsStrItem.lcsPos[0]==-1){
//			System.out.println("=======");
//			System.out.println(start);
//			System.out.println(source);
//			System.out.println(target);
        return getDiffEncode(start,source,target);
    }
    else{
        var preArray=mixDiff(start,lcsStrItem.srcPre,lcsStrItem.tarPre,lcsMaxLen);
        console.log("sfsdf"+reArray+"    safdasfsad"+preArray);
        reArray=addMerge(reArray, preArray);
        console.log(reArray);
        var midArray=new Array();
        midArray.push(lcsStrItem.lcsPos);
        //console.log( midArray);
        reArray=addMerge(reArray,midArray);
        //console.log(reArray);
        var nextStart=lcsStrItem.lcsPos[0]+lcsStrItem.lcsPos[1]-1 ;
        var nextArray=mixDiff(nextStart,lcsStrItem.srcNext,lcsStrItem.tarNext,lcsMaxLen);
        reArray=addMerge(reArray, nextArray);
        //console.log(reArray);
    }
    console.log(reArray);
    return reArray;
}
exports.getDiff=function(start,source,target,lcsMaxLen){
    return mixDiff(start,source,target,lcsMaxLen) ;

};
//var src="define('init',['util','p1'],function(){console.log('dafds init depend on uil p1 ok!'),document.write('init depend on util p2 ok!</br>')}),define('util',[],function(){console.log('ut ok!'),document.write('util ok!</br>')});sadfafds";
//var target="sdf define('init',['util','p1'],function(){console.log(' int depnd on util sdfs p1 ok 49!'),document.write('init depend on 34 util p2 ok!</br>')}),define('util',[],function(){console.log('util ok!'),document.write('il ok!</br>')});csadf";
//
////String src="12";
////String target="1e3    您好434";
//var json=mixDiff(0,src,target,500);
//console.log(json);