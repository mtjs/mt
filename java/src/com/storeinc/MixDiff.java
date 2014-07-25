package com.storeinc;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.security.MessageDigest;


import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
/**
 * LCSDIFF本身有性能问题，需要结合chunkDiff来拆分任务
 * @author waynelu
 *
 */
public class MixDiff {

	class LcsItem {
	   public String  srcPre;
	   public String  tarPre;
	   public JSONArray   lcsPos;
	   public String  srcNext;
	   public String  tarNext;
	@Override
	public String toString() {
		return "LcsItem [srcPre=" + srcPre + ", tarPre=" + tarPre + ", lcsPos="
				+ lcsPos.toJSONString() + ", srcNext=" + srcNext
				+ ", tarNext=" + tarNext + "]";
	}

	}
	public MixDiff() {
		// TODO Auto-generated constructor stub
	}
	/**
	 * 编辑距离算法
	 * @param source
	 * @param target
	 * @return
	 */
	public JSONArray getDiffEncode(int start,String oldContentStr,String newContentStr){
		JSONArray jsonArray=lcsDiff(oldContentStr,newContentStr);
		//System.out.println("diffencode"+jsonArray);
		for(int i=0;i<jsonArray.size();i++){
			Object jObj=jsonArray.get(i);
			if(jObj instanceof JSONArray ){
				JSONArray jsonObj=(JSONArray)jObj;
				jsonObj.set(0, (jsonObj.getIntValue(0)+start));
			}
		}
		if(jsonArray.size()==0){
			JSONArray tempArray=new JSONArray();
			tempArray.add(start+1);
			tempArray.add(oldContentStr.length());
			jsonArray.add(tempArray);
		}
		return jsonArray;
	}
	public JSONArray  lcsDiff(String source,String target){
		LcsDiff lcsDiff=new LcsDiff();
	//System.out.println("lcsdiff:   "+source+" ||||| "+target );
		return lcsDiff.diff(source, target).getJSONArray("data");
	}
	/**
	 * 
	 * @param source
	 * @param target
	 * @param chunkSize
	 * @return
	 */
	public JSONArray   chunkDiff(String source,String target,int chunkSize){
		ChunkDiff chunkUtil = new ChunkDiff();
		JSONObject json=chunkUtil.makeIncDataFile(source, target, chunkSize);
		return json.getJSONArray("data");

	}
	public LcsItem getLcsStrByChunk(int initStart,String source,String target,int minLen){
		//JSONObject  chunkDiffJson=chunkDiff(source,target,12);
		JSONArray dataArray=chunkDiff(source,target,12);
		LcsItem lcsStrItem=new LcsItem();
		JSONArray lcsPosInit=new JSONArray();
		lcsPosInit.add(-1);
		lcsPosInit.add(-1);
		lcsStrItem.lcsPos=lcsPosInit;
		int maxLen=0;
		for(int i=0;i<dataArray.size();i++){
			Object jObj=dataArray.get(i);
			if(jObj instanceof JSONArray ){
				JSONArray jsonObj=(JSONArray)jObj;
				int len=jsonObj.getIntValue(1)*12;
				int start=jsonObj.getIntValue(0)*12;
				int end=start+len;
				if(len>=minLen&&len>maxLen){
					JSONArray lcsPos=new JSONArray();
					lcsPos.add(start+1+initStart);
					lcsPos.add(len);
			        
					String lcsStr=source.substring(start, end);
					lcsStrItem.srcPre=source.substring(0,start);
					lcsStrItem.srcNext=source.substring(end,source.length());
					lcsStrItem.lcsPos=lcsPos;
					//System.out.println(lcsStr);
					int tarStart=target.indexOf(lcsStr);
					int tarEnd=tarStart+lcsStr.length();
					lcsStrItem.tarPre=target.substring(0,tarStart);
					lcsStrItem.tarNext=target.substring(tarEnd,target.length());
					maxLen=len;
				}
			}
		}
		
		return lcsStrItem;
	}
	
	public JSONArray mixDiff(int start,String source,String target,int lcsMaxLen){
//		if(source.length()<300)
//		System.out.println("new mixDiff:"+start+"|"+source+"|"+target);
		int minLen=12;
		int sourceLen=source.length();
		int targetLen=target.length();
		JSONArray reArray=new JSONArray();
		//如果是
		if((sourceLen*targetLen<lcsMaxLen*lcsMaxLen)&&(sourceLen*targetLen)>0){
//			System.out.println(start);
//			System.out.println(source);
//			System.out.println(target);
			return getDiffEncode(start,source,target);
		}
		LcsItem lcsStrItem=getLcsStrByChunk(start,source, target, minLen);
		//System.out.println("lcs::::"+lcsStrItem);
		if(lcsStrItem.lcsPos.getIntValue(0)==-1){
//			System.out.println("=======");
//			System.out.println(start);
//			System.out.println("======="+source+"=======");
//			System.out.println("======="+target+"=======");
			return getDiffEncode(start,source,target);
		}
		else{
			JSONArray preArray=mixDiff(start,lcsStrItem.srcPre,lcsStrItem.tarPre,lcsMaxLen);
			addMerge(reArray, preArray);
			JSONArray midArray=new JSONArray();
			midArray.add(lcsStrItem.lcsPos);
			addMerge(reArray,midArray);
			int nextStart=lcsStrItem.lcsPos.getIntValue(0)+lcsStrItem.lcsPos.getIntValue(1)-1 ;
			JSONArray nextArray=mixDiff(nextStart,lcsStrItem.srcNext,lcsStrItem.tarNext,lcsMaxLen);
			addMerge(reArray, nextArray);
		}
		return reArray;
	}
	public String merge(String oldContent,JSONObject incData){
		String reContent="";
		JSONArray dataArray=incData.getJSONArray("data");
		for(int i=0;i<dataArray.size();i++){
			Object jObj=dataArray.get(i);
			if(jObj instanceof JSONArray){
				JSONArray jsonObj=(JSONArray)jObj;
				int start=jsonObj.getIntValue(0)-1;
				int len=jsonObj.getIntValue(1);
				//System.out.println("merge lcs:"+oldContent.substring(start,start+len));
				reContent+=oldContent.substring(start,start+len);
				
			}
			else{
				//System.out.println("merge modify:"+jObj.toString());
				reContent+=jObj.toString();
			}
		}
		
		return reContent;
	}
	public void addMerge(JSONArray strDataArray,JSONArray addArry){
	//	System.out.println(strDataArray+" "+addArry);
		if(strDataArray.size()==0){
			strDataArray.addAll(addArry);
			return;
		}
		Object jObj=strDataArray.get(strDataArray.size()-1);
		Object addObj=addArry.get(0);
		if((jObj instanceof JSONArray )&&(addObj instanceof JSONArray )){
			JSONArray jsonObj=(JSONArray)jObj;
			JSONArray addArrayObj=(JSONArray)addObj;
			if(jsonObj.getIntValue(0)+jsonObj.getIntValue(1)==addArrayObj.getIntValue(0)){
				jsonObj.set(1, (jsonObj.getIntValue(1)+addArrayObj.getIntValue(1)));
				strDataArray.addAll(addArry.subList(1, addArry.size()));
			}
			else{
				strDataArray.addAll(addArry);
			}
		}
		else{
			strDataArray.addAll(addArry);
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
				bfin.close();
			} catch (Exception ex) {

			}
		}
		return strBuffer.toString();

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
	public JSONObject makeIncDataFromContent(String source,String target){
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
		JSONArray jArray=mixDiff(0,source, target,12);
		resultFile.put("data", jArray);
		return resultFile;
	}
	public JSONObject makeIncDataFromFile(String oldFile, String newFile
			) {
		
		String oldContent = readFile(oldFile, "utf-8");
		String newContent = readFile(newFile, "utf-8");
		return makeIncDataFromContent(oldContent,newContent);
		
		//return Diff(oldContent, newContent);

	}
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String src="define('init',['util','p1'],function(){console.log('dafds init depend on uil p1 ok!'),document.write('init depend on util p2 ok!</br>')}),define('util',[],function(){console.log('ut ok!'),document.write('util ok!</br>')});sadfafds";
		String target="sdf define('init',['util','p1'],function(){console.log(' int depnd on util sdfs p1 ok 49!'),document.write('init depend on 34 util p2 ok!</br>')}),define('util',[],function(){console.log('util ok!'),document.write('il ok!</br>')});csadf";
	
		//String src="12";
		//String target="1e3    您好434";
		MixDiff dUtil = new MixDiff();
		//ChunkDiff Util = new ChunkDiff();
		///Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp///release/2014071500017///base-2014071500017.js /Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp///release/2014071600018///base-2014071600018.js
		//src = dUtil.readFile("Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp///release/2014071500017///base-2014071500017.js", "utf-8");
		//target= dUtil.readFile("/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp///release/2014071600018///base-2014071600018.js", "utf-8");
		JSONObject json = dUtil
				.makeIncDataFromFile(
						"/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp///release/2014071500017///base-2014071500017.js",
						"/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp///release/2014071600018///base-2014071600018.js");
		JSONObject json1 = dUtil.makeIncDataFromContent(src,target);
		//LcsDiff lcsUtil = new LcsDiff();
		//System.out.println(lcsUtil.diff(src, target));
		System.out.println(json.toJSONString());
		//System.out.println(Util.makeIncDataFile(src,target,12));
//		JSONObject json = dUtil.makeIncDataFromFile(
//						"/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp/release/2014071500017/base-2014071500017.js",
//						"/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp/release/2014071600018/base-2014071600018.js"
//						);
//		
		//System.out.println(json.toJSONString());
		String mergeContent=dUtil.merge(src,json1);
		System.out.println(target);
		System.out.println(mergeContent);
		if(target.equals(mergeContent)){
			System.out.println(true);
		}
		else{
			System.out.println(false);
		}

	}

}
