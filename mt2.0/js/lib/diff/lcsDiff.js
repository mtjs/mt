/**
 * Created with JetBrains WebStorm.
 * User: waynelu
 * Date: 14-5-28
 * Time: 下午5:14
 * getdiff data from lcs
 */
exports.getDiff=function lcsDiff(source,target){
    var SAME= 0,REPLACE= 1,DELETE= 2,INSERT=3;
    var sourceArr=source.split('');
    //var sLength=sourceArr.length;
    var targetArr=target.split('');
    //var tLength=targetArr.length;
    //编辑距离矩阵
    var disMatrix=[];
    //步骤矩阵
    var stepMatrix=[];
    //生成一个空矩阵，二维数组
    for(var i=0;i<=sourceArr.length;i++){
        disMatrix[i]=[];
        stepMatrix[i]=[];
        for(var j=0;j<=targetArr.length;j++){
            disMatrix[i][j]=0;
            stepMatrix[i][j]=0;
        }
    }
//    console.log(disMatrix);
//    console.log(stepMatrix);
    for(var i=0;i<=sourceArr.length;i++){
        for(var j=0;j<=targetArr.length;j++){
            // console.log(i+" "+j);
            //在第0步，由于都是空，所以是0
            if(i==0&&j==0){
                disMatrix[i][j]=0;
                stepMatrix[i][j]=SAME;
            }
            else if(i==0&&j>0){
                disMatrix[i][j]=j;
                stepMatrix[i][j]=INSERT;
            }
            else if(j==0&&i>0){
                disMatrix[i][j]=i;
                stepMatrix[i][j]=DELETE;
            }
            else if(i>0&&j>0){
                var sameStep=(sourceArr[i-1]===targetArr[j-1]),
                    delStep=disMatrix[i-1][j]+1,
                    insertStep=disMatrix[i][j-1]+1,
                    replaceStep=disMatrix[i-1][j-1]+(sameStep?0:1);
                //console.log(i+' '+j+":"+replaceStep+' '+delStep+' '+insertStep+" v:"+sourceArr[i-1]+' '+targetArr[j-1]);
                //console.log(i+' '+j+":"+replaceStep+' '+delStep+' '+insertStep);
                disMatrix[i][j]=Math.min(replaceStep,delStep,insertStep);
                var stepAct=disMatrix[i][j];
                switch(stepAct){
                    case replaceStep:
                        stepMatrix[i][j]=sameStep?SAME:REPLACE;
                        break;
                    case insertStep:
                        stepMatrix[i][j]=INSERT;
                        break;
                    case delStep:
                        stepMatrix[i][j]=DELETE;
                        break;
                }
                // console.log(i+' '+j+":"+replaceStep+' '+delStep+' '+insertStep+' act :'+stepMatrix[i][j]);
            }
        }
    }


    //console.log(disMatrix);
    //console.log(stepMatrix);
    var diff=[];
    for(i=sourceArr.length,j=targetArr.length;i>0&&j>0;){
        var step=stepMatrix[i][j];
        switch(step){
            case SAME:
                diff[j-1]=[i,SAME];
                i--;j--;
                break;
            case REPLACE:
                diff[j-1]=targetArr[j-1];
                i--;j--;
                break;
            case DELETE:
                diff[j-1]=DELETE;
                i--;
                break;
            case INSERT:
                diff[j-1]=targetArr[j-1];
                j--;
                break;

        }
    }
    var preItem,tempStr='',tempArr,reArr=[];
    for(i=0;i<diff.length;i++){
        var item=diff[i];
        if(i==0){
            if(typeof(item)=='string'){
                tempStr=item;
            }
            else{
                tempArr=item;
                tempArr[1]=1;
            }
            //continue;
        }
        else{
            if(typeof(item)=='string'){
                tempStr=tempStr+item;
                if(typeof(preItem)=='object'){
                    reArr.push(tempArr);
                }
            }
            else{

                if(typeof(preItem)=='string'){
                    tempArr=item;
                    tempArr[1]=tempArr[1]+1;
                    reArr.push(tempStr);
                    tempStr='';
                }
                else{
                    if(preItem[0]==(item[0]-1)){
                        tempArr[1]=tempArr[1]+1;
                    }
                    else{
                        reArr.push(tempArr);
                        tempArr=item;
                        tempArr[1]=tempArr[1]+1;
                    }
                }
            }
        }
        preItem=item;
    }
    if(typeof(preItem)=='string'){
        reArr.push(tempStr);
    }
    else{
        reArr.push(tempArr);
    }
    return reArr;

}

