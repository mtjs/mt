/**
 * Created by .
 * User: waynelu
 * Date: 13-8-30
 * Time: 上午11:27
 * 根据新旧文件文件内容 生成增量更新json
 */
var crypto = require('crypto');
exports.makeinc=function(oldFileContent,newFileContent,chunkSize){
    return makeIncDataFile(oldFileContent,newFileContent,chunkSize);
};
//根据新旧文件文件内容 生成增量更新json
function makeIncDataFile(oldFileContent,newFileContent,chunkSize){
    var resultFile={};
    //是否变更
    resultFile.modify=true;
    resultFile.chunkSize=chunkSize;
    var strDataArray=new Array();
    //计算新旧两个文件，如果相同则说明文件没有改动,则直接返回空数组
    if(getMd5(oldFileContent)==getMd5(newFileContent)){
        resultFile.modify=false;
        resultFile.data=strDataArray;
        return resultFile;
    }
    var oldChecksum=oldFileChecksum(oldFileContent,chunkSize);
    var diffArray=searchChunk(newFileContent,oldChecksum,chunkSize);
    var arrayData ="";
    var lastitem=null;
    var matchCount=0;
    var size=diffArray.length;

//生成json，同时合并连续命中的块，压缩数据
    for(var i=0;i<size;i++){

        var item=diffArray[i];
        if (item.isMatch) {
            //如果第一个匹配，
            if(lastitem==null||!lastitem.isMatch){
                arrayData="["+item.data+",";
                matchCount=1;
            }
            else if(lastitem.isMatch&&lastitem.data+1==item.data){
                matchCount++;
            }
            else if(lastitem.isMatch&&(lastitem.data+1)!=item.data){
                arrayData+=matchCount+"]";
                strDataArray.push(JSON.parse(arrayData));
                arrayData="["+item.data+","
                matchCount=1;
            }
            if(i==(size-1)){
                arrayData+=matchCount+"]";
                strDataArray.push(JSON.parse(arrayData));
                arrayData="";
            }
        } else {
            if(matchCount>0){
                arrayData+=matchCount+"]";
                strDataArray.push(JSON.parse(arrayData));
                arrayData="";
                matchCount=0;
            }
            //&quot;
            var data=item.data;
            strDataArray.push(data);
        }
        lastitem=item;
    }
    resultFile.data=strDataArray;
    return resultFile;
}

function diffItem(m,dt){
    this.isMatch=m;//是不是能找到一样的数据块
    this.data=dt;//如果是新数据直接是一个字符串，如果是老数据则，记住块号
}
// 如果是新数据把新数据放入最终队列里面
function doExactNewData( incDataArray,data){
    var di = new diffItem(false,data);
    incDataArray.push(di);
}
/**
 * 如果是老数据，则将匹配块号发放到最终队列里面
 * @param incDataArray
 * @param chunkNo
 */
function doExactMatch( incDataArray,chunkNo) {
    // 写块匹配
    var di = new diffItem(true,chunkNo);
    incDataArray.push(di);
}
/**
 *用新版文件内容在老板内容的map里面滚动查找，生成一个增量更新文件的map
 * @param newFile
 * @param checksumArray
 * @param chunkSize
 * @return
 */
function searchChunk(strInput,checksumArray,chunkSize){
    var incDataArray=new Array();
    //chunk
    var buffer=null;
    //用于缓存两个匹配块之间的新增数据
    var outBuffer ="";
    // 指向块后的第一个字符
    var currentIndex = 0;
    var tLen=strInput.length;
    var lastmatchNo=0;
    while(currentIndex<=tLen){
        var endIndex=currentIndex+chunkSize;
        if(endIndex>tLen){
            endIndex=tLen;
        }
        buffer=strInput.substring(currentIndex,endIndex);
        var chunkMd5=getMd5ByText(buffer);
        var matchTrunkIndex=checkMatchIndex(chunkMd5,checksumArray,lastmatchNo);
        //若果是最后一个
        if(endIndex>tLen-1){
            //先把新块压入队列
            if(outBuffer.length>0&&!outBuffer==""){
                doExactNewData(incDataArray,outBuffer);
                outBuffer="";
            }
            if(buffer.length>0&&!buffer==""){
                doExactNewData(incDataArray,buffer);
            }
            currentIndex=currentIndex+chunkSize;
        }
        //如果找到匹配块
        else if(matchTrunkIndex>=0){
            //先把新块压入队列
            if(outBuffer.length>0&&!outBuffer==""){
                doExactNewData(incDataArray,outBuffer);
                outBuffer="";
            }
            doExactMatch(incDataArray, matchTrunkIndex);
            currentIndex=currentIndex+chunkSize;

        }
        else{
            outBuffer=outBuffer+strInput.substring(currentIndex,currentIndex+1);
            currentIndex++;
        }
        if(matchTrunkIndex>=0){lastmatchNo=matchTrunkIndex};

    }
    return incDataArray;
};
/**
 *生成老文件的md5，块号信息
 * @param fileC
 * @param chunkSize
 * @return
 */
function oldFileChecksum(fileC,chunkSize) {

    var txt = fileC;
    var checksumArray={};
    var currentIndex=0;
    var len=txt.length;
    var chunkNo=0;
    while(currentIndex<len) {
        var chunk=txt.substr(currentIndex,chunkSize);
        var chunkMd5=getMd5ByText(chunk);
        //用map来解决冲突,
        var numArray=checksumArray[chunkMd5];
        //如果没有过一个一样的
        if(typeof(numArray)=='undefined'){
            numArray=new Array();

        }
        numArray.push(chunkNo);
        checksumArray[chunkMd5]=numArray;
        currentIndex=currentIndex+chunkSize;
        chunkNo++;
    }
    return checksumArray;
};
//md5计算
function getMd5ByText(s) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(s);
    return md5sum.digest('hex');
};

// 从一个匹配的块号序列里面获取离上一个匹配的块号最近的块好
// ，有利于压缩数据
function getMatchNo(numArray,lastmatchNo){
    if(numArray.length==1){
        return numArray[0];
    }
    else{
        var lastNo=numArray[0];
        var reNo=0;
        for(var i=0;i<numArray.length;i++){
            var curNo=numArray[i];
            if(curNo>=lastmatchNo&&lastNo<=lastmatchNo){
                return (lastmatchNo-lastNo)>=(curNo-lastmatchNo)?curNo:lastNo;
            }
            else if(curNo>=lastmatchNo&&lastNo>=lastmatchNo){
                return lastNo;
            }
            else if(curNo<=lastmatchNo&&lastNo<=lastmatchNo){
                reNo=curNo;
            }
            else {
                reNo=curNo;
            }
            lastNo=curNo;
        }
        return  reNo;
    }
}
//获取某个md5值的匹配块号，如果没有返回-1
function checkMatchIndex(chunkMd5,checksumArray,lastmatchNo){
    var numArray=checksumArray[chunkMd5];
    if(typeof(numArray)=='undefined'){
        return -1;
    }
    else{
        return getMatchNo(numArray,lastmatchNo);
    }
}
//md5计算
function getMd5(c) {
    var s = c;
    var md5sum = crypto.createHash('md5');
    md5sum.update(s);
    return md5sum.digest('hex');
};
