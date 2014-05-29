package com.storeinc;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.security.MessageDigest;
import java.util.ArrayList;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

public class LcsDiff {

	public LcsDiff() {
		// TODO Auto-generated constructor stub
	}
	class DiffItem {
		public int type;//0，数组，1数字，2字符
		public Object data;

		DiffItem(int m, Object dt) {
			this.type = m;
			this.data = dt;
		}

	}
//	private void printMatrix( int[][] disMatrix){
//		int xlen=disMatrix.length;
//		int ylen=disMatrix[0].length;
//		for(int i=0;i<xlen;i++){
//			for(int j=0;j<ylen;j++){
//				System.out.print(" "+disMatrix[i][j]);
//			}
//			System.out.println("");
//		}
//	}
	JSONObject  Diff(String source,String target){
		JSONObject resultFile = new JSONObject();
		resultFile.put("modify", true);
		// resultFile.modify=true;
		resultFile.put("chunkSize",12);
		resultFile.put("diffAlg", "lcs");
		JSONArray strDataArray = new JSONArray();
		if (MD5(source).equals(MD5(target))) {
			resultFile.put("modify", false);
			resultFile.put("data", strDataArray);
			return resultFile;
		}
		final int  SAME= 0,REPLACE= 1,DELETE= 2,INSERT=3;
	    
	    String[] sourceTempArr=source.split("");//  source.split('');
	    String[] targetTempArr=target.split("");
	    String[] sourceArr=new String[sourceTempArr.length-1];
	    String[] targetArr=new String[targetTempArr.length-1];
	    for(int jx=1;jx<sourceTempArr.length;jx++){
	    	sourceArr[jx-1]=sourceTempArr[jx];
	    }
	    for(int jx=1;jx<targetTempArr.length;jx++){
	    	targetArr[jx-1]=targetTempArr[jx];
	    }
	    
	    int[][] disMatrix=new int[sourceArr.length+1][targetArr.length+1];
	    int[][] stepMatrix=new int[sourceArr.length+1][targetArr.length+1];
	    //var tLength=targetArr.length;
	    //编辑距离矩阵
	   // ArrayList<ArrayList<Integer>> disMatrix=new ArrayList<ArrayList<Integer>>();
	    //步骤矩阵
	    //var stepMatrix=[];
	    //ArrayList<ArrayList<Integer>> stepMatrix=new ArrayList<ArrayList<Integer>>();
	    //生成一个空矩阵，二维数组
	    for(int i=0;i<=sourceArr.length;i++){
	        for(int j=0;j<=targetArr.length;j++){
	            disMatrix[i][j]=0;
	            stepMatrix[i][j]=0;
	        }
	    }
//	    console.log(disMatrix);
//	    console.log(stepMatrix);
	    for(int i=0;i<=sourceArr.length;i++){
	        for(int j=0;j<=targetArr.length;j++){
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
	                boolean sameStep=(sourceArr[i-1].equals(targetArr[j-1]));
	                final int   delStep=disMatrix[i-1][j]+1;
	                final int   insertStep=disMatrix[i][j-1]+1;
	                final int   replaceStep=disMatrix[i-1][j-1]+(sameStep?0:1);
	                //console.log(i+' '+j+":"+replaceStep+' '+delStep+' '+insertStep+" v:"+sourceArr[i-1]+' '+targetArr[j-1]);
	                //console.log(i+' '+j+":"+replaceStep+' '+delStep+' '+insertStep);
	                int min=Math.min(replaceStep,delStep);
	                disMatrix[i][j]=Math.min(min,insertStep);
	                int stepAct=disMatrix[i][j];
	                if(stepAct==replaceStep){
	                	  stepMatrix[i][j]=sameStep?SAME:REPLACE;
	                }
	                else if(stepAct==insertStep){
	                	 stepMatrix[i][j]=INSERT;
	                }
	                else if(stepAct==delStep){
	                	 stepMatrix[i][j]=DELETE;	                	
	                }
//	                switch(stepAct){
//	                    case replaceStep:
//	                        stepMatrix[i][j]=sameStep?SAME:REPLACE;
//	                        break;
//	                    case insertStep:
//	                        stepMatrix[i][j]=INSERT;
//	                        break;
//	                    case delStep:
//	                        stepMatrix[i][j]=DELETE;
//	                        break;
//	                }
	                // console.log(i+' '+j+":"+replaceStep+' '+delStep+' '+insertStep+' act :'+stepMatrix[i][j]);
	            }
	        }
	    }


	   // printMatrix(disMatrix);
	    //System.out.println("==========");
	    //printMatrix(stepMatrix);
	   // System.out.println(targetArr.length);
	   // ArrayList<DiffItem> diff=new ArrayList<DiffItem>(targetArr.length+1);
	    DiffItem[] diff=new DiffItem[targetArr.length];
	    for(int i=sourceArr.length,j=targetArr.length;i>0||j>0;){
	        int step=stepMatrix[i][j];
	        //System.out.println(i+" "+j);
	        switch(step){
	            case SAME:
	            	Integer[] intArray={i,SAME};
	            	DiffItem dItem=new DiffItem(0,intArray);
	            	diff[j-1]=dItem;
	              //  diff.set(j-1,dItem);
	                i--;j--;
	                break;
	            case REPLACE:
	               // diff[j-1]=targetArr[j-1];
	            	DiffItem dItem1=new DiffItem(2,targetArr[j-1]);
	            	diff[j-1]=dItem1;
	                //diff.set(j-1,dItem1);
	                i--;j--;
	                break;
	            case DELETE:
	            	DiffItem dItem2=new DiffItem(1,DELETE);
	            	diff[j-1]=dItem2;
	                //diff.set(j-1,dItem2);
	                //diff[j-1]=DELETE;
	                i--;
	                break;
	            case INSERT:
	            	DiffItem dItem3=new DiffItem(2,targetArr[j-1]);
	            	diff[j-1]=dItem3;
	                //diff.set(j-1,dItem3);
	                j--;
	                break;

	        }
	    }
	    DiffItem  preItem=null;
	    String tempStr="";
	    DiffItem tempArrItem=null;
	    ArrayList<DiffItem> reArr=new ArrayList<DiffItem>();
	    for(int i=0;i<diff.length;i++){
	        DiffItem item=diff[i];
	        if(i==0){
	            if(item.type==2){
	                tempStr=(String) item.data;
	            }
	            else{
	            	tempArrItem=item;
	            	Integer[] intArray=(Integer[]) tempArrItem.data;
	            	intArray[1]=1;
	            }
	            //continue;
	        }
	        else{
	            if(item.type==2){
	                tempStr=tempStr+(String)item.data;
	                if(preItem.type==0){
	                	
	                	DiffItem newItem=new DiffItem(tempArrItem.type,tempArrItem.data);
	                	//Integer[] intArray=(Integer[]) tempArrItem.data;
	                	//System.out.println(intArray[0]+" "+intArray[1]);
                        reArr.add(newItem);
	                }
	            }
	            else{

	                if(preItem.type==2){
	                	tempArrItem=item;
	                	Integer[] intArray=(Integer[]) tempArrItem.data;
	                	intArray[1]=intArray[1]+1;
	                    reArr.add(new DiffItem(2,tempStr));
	                    tempStr="";
	                }
	                else{
	                	Integer[] preArray=(Integer[]) preItem.data;
	                	Integer[] itemArray=(Integer[]) item.data;
	                    if(preArray[0]==(itemArray[0]-1)){
	                    	Integer[] intArray=(Integer[]) tempArrItem.data;
	                    	intArray[1]=intArray[1]+1;
	                    }
	                    else{
	                    	DiffItem newItem=new DiffItem(tempArrItem.type,tempArrItem.data);
	                        reArr.add(newItem);
	                        tempArrItem=item;
	                        Integer[] intArray=(Integer[]) tempArrItem.data;
	                    	intArray[1]=intArray[1]+1;
	                    }
	                }
	            }
	        }
	        preItem=item;
	    }
	    if(preItem.type==2){
	    	  reArr.add(new DiffItem(2,tempStr));
	    }
	    else{
	        reArr.add(tempArrItem);
	    }
	    for(int i=0;i<reArr.size();i++){
	        DiffItem item=reArr.get(i);
	        //System.out.println(i+":"+item.type);
	        if(item.type==2){
	        	//System.out.println(i+":"+item.data);
	        	strDataArray.add(item.data);
	        }
	        else{
	        	
	        	 Integer[] intArray=(Integer[]) item.data;
	        	 JSONArray iArray = new JSONArray();
	        	 iArray.add(intArray[0]);
	        	 iArray.add(intArray[1]);
	        	 strDataArray.add(iArray);
	        	 //System.out.println(i+":["+intArray[0]+" ,"+intArray[1]+"]"); 
	        }
	        
	    }
	    resultFile.put("data", strDataArray);
		
	    return resultFile;

	}
	private String MD5(String s) {
		char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
				'A', 'B', 'C', 'D', 'E', 'F' };
		try {
			byte[] btInput = s.getBytes();

			MessageDigest mdInst = MessageDigest.getInstance("MD5");

			mdInst.update(btInput);

			byte[] md = mdInst.digest();

			int j = md.length;
			char str[] = new char[j * 2];
			int k = 0;
			for (int i = 0; i < j; i++) {
				byte byte0 = md[i];
				str[k++] = hexDigits[byte0 >>> 4 & 0xf];
				str[k++] = hexDigits[byte0 & 0xf];
			}
			return new String(str);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	public String readFile(String file, String encode) {
		File a = new File(file);
		StringBuffer strBuffer = new StringBuffer("");
		;
		if (a.exists()) {
			try {
				FileInputStream fi = new FileInputStream(a);

				InputStreamReader isr = new InputStreamReader(fi, "utf-8");
				BufferedReader bfin = new BufferedReader(isr);
				String rLine = "";
				while ((rLine = bfin.readLine()) != null) {
					strBuffer.append(rLine);
				}
			} catch (Exception ex) {

			}
		}
		return strBuffer.toString();

	}
	public JSONObject makeIncDataFromFile(String oldFile, String newFile
			) {
		String oldContent = readFile(oldFile, "utf-8");
		String newContent = readFile(newFile, "utf-8");
		return Diff(oldContent, newContent);

	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		// TODO Auto-generated method stub
		String src="define('init',['util','p1'],function(){console.log(' init depend on util p1 ok 49!'),document.write('init depend on util p1 ok!</br>')}),define('util',[],function(){console.log('util ok!'),document.write('util ok!</br>')});";
		String target="define('init',['util','p1'],function(){console.log(' init depend on util p1 ok!'),document.write('init depend on util p1 ok!</br>')}),define('util',[],function(){console.log('util ok!'),document.write('util ok!</br>')});";
		//String src="12";
		//String target="1e3    您好434";
		LcsDiff dUtil = new LcsDiff();
		//JSONObject json = dUtil.Diff(target,src);
		JSONObject json = dUtil.makeIncDataFromFile(
						"/Users/waynelu/storeinc/demo/static/hello/dist/1.0.6/main-1.0.6.js",
						"/Users/waynelu/storeinc/demo/static/hello/dist/1.0.7/main-1.0.7.js"
						);
		System.out.println(json.toJSONString());
	}

}
