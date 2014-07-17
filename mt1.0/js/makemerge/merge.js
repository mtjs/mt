/**
 * Created by .
 * User: waynelu
 * Date: 13-8-30
 * Time: 上午11:27
 * 根据上一个版本的js,块大小，增量文件合并成新版本js
 */
    //根据旧数据和增量数据合成新js内容
    function mergejs(source,trunkSize,checksumcode){
        var strResult="";
        for(var i=0;i<checksumcode.length;i++){
            var code=checksumcode[i];
            if(typeof (code)=='string'){
                strResult+=code;
            }
            else{
                var start=code[0]*trunkSize;
                var end=code[1]*trunkSize;
                var oldcode=source.substr(start,end);
                strResult+=oldcode;
            }
        }
        return strResult;
    }
