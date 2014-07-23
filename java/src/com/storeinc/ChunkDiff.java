package com.storeinc;

import java.io.BufferedReader;



import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

/**
 * @author waynelu 计算两个文件之间的增量，并返回增量文件
 */
public class ChunkDiff {
	class DiffItem {
		private boolean isMatch;
		private String data;

		DiffItem(boolean m, String dt) {
			this.isMatch = m;
			this.data = dt;
		}

		public boolean isMatch() {
			return isMatch;
		}

		public void setMatch(boolean isMatch) {
			this.isMatch = isMatch;
		}

		public String getData() {
			return data;
		}

		public void setData(String data) {
			this.data = data;
		}

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

	public HashMap<String, ArrayList<Integer>> getOldMd5Map(String txt,
			int chunkSize) {
		HashMap<String, ArrayList<Integer>> md5Map = new HashMap<String, ArrayList<Integer>>();

		int currentIndex = 0;
		int len = txt.length();
		int chunkNo = 0;
		while (currentIndex < len) {
			int end = currentIndex + chunkSize;
			if (end > len) {
				end = len;
			}
			String chunk = txt.substring(currentIndex, end);
			String chunkMd5 = MD5(chunk);

			ArrayList<Integer> numArray = md5Map.get(chunkMd5);
			if (numArray == null) {
				numArray = new ArrayList<Integer>();
			}
			numArray.add(chunkNo);
			md5Map.put(chunkMd5, numArray);
			// checksumArray[chunkMd5]=numArray;
			currentIndex = currentIndex + chunkSize;
			chunkNo++;
		}
		return md5Map;

	}

	private int getMatchNo(ArrayList<Integer> numArray, int lastmatchNo) {
		if (numArray.size() == 1) {
			return numArray.get(0);
		} else {
			int lastNo = numArray.get(0);
			int reNo = 0;
			for (int i = 0; i < numArray.size(); i++) {
				int curNo = numArray.get(i);
				if (curNo >= lastmatchNo && lastNo <= lastmatchNo) {
					return (lastmatchNo - lastNo) >= (curNo - lastmatchNo) ? curNo
							: lastNo;
				} else if (curNo >= lastmatchNo && lastNo >= lastmatchNo) {
					return lastNo;
				} else if (curNo <= lastmatchNo && lastNo <= lastmatchNo) {
					reNo = curNo;
				} else {
					reNo = curNo;
				}
				lastNo = curNo;
			}
			return reNo;
		}
	}

	private int checkMatchIndex(String chunkMd5,
			HashMap<String, ArrayList<Integer>> checksumArray, int lastmatchNo) {
		ArrayList<Integer> numArray = checksumArray.get(chunkMd5);
		if (numArray == null) {
			return -1;
		} else {
			return getMatchNo(numArray, lastmatchNo);
		}
	}

	private void doExactNewData(ArrayList<DiffItem> incDataArray, String data) {
		DiffItem di = new DiffItem(false, data);
		incDataArray.add(di);
	}

	private void doExactMatch(ArrayList<DiffItem> incDataArray, String chunkNo) {

		DiffItem di = new DiffItem(true, chunkNo);
		incDataArray.add(di);
	}

	private ArrayList<DiffItem> searchChunk(String strInput,
			HashMap<String, ArrayList<Integer>> checksumArray, int chunkSize) {

		ArrayList<DiffItem> incDataArray = new ArrayList<DiffItem>();
		// chunk
		String buffer = null;

		String outBuffer = "";

		int currentIndex = 0;
		int tLen = strInput.length();
		int lastmatchNo = 0;
		while (currentIndex <= tLen) {
			int endIndex = currentIndex + chunkSize;
			if (endIndex > tLen) {
				endIndex = tLen;
			}
			buffer = strInput.substring(currentIndex, endIndex);

			String chunkMd5 = MD5(buffer);
			int matchTrunkIndex = checkMatchIndex(chunkMd5, checksumArray,
					lastmatchNo);

			if (endIndex > tLen - 1) {

				if (outBuffer.length() > 0 && !outBuffer.equals("")) {
					doExactNewData(incDataArray, outBuffer);
					outBuffer = "";
				}
				if (buffer.length() > 0 && !buffer.equals("")) {
					doExactNewData(incDataArray, buffer);
				}
				currentIndex = currentIndex + chunkSize;
			}

			else if (matchTrunkIndex >= 0) {

				if (outBuffer.length() > 0 && !outBuffer.equals("")) {
					doExactNewData(incDataArray, outBuffer);
					outBuffer = "";
				}
				doExactMatch(incDataArray, String.valueOf(matchTrunkIndex));
				currentIndex = currentIndex + chunkSize;

			} else {
				outBuffer = outBuffer
						+ strInput.substring(currentIndex, currentIndex + 1);
				currentIndex++;
			}
			if (matchTrunkIndex >= 0) {
				lastmatchNo = matchTrunkIndex;
			}

		}
		return incDataArray;
	}

	public JSONObject makeIncDataFile(String oldFile, String newFile,
			int chunkSize) {
		//System.out.println("new chunkDiff");
		JSONObject resultFile = new JSONObject();
		resultFile.put("modify", true);
		// resultFile.modify=true;
		resultFile.put("chunkSize", chunkSize);
		resultFile.put("diffAlg", "chunk");
		
		JSONArray strDataArray = new JSONArray();
		if (MD5(oldFile).equals(MD5(newFile))) {
			resultFile.put("modify", false);
			resultFile.put("data", strDataArray);
			return resultFile;
		}
		// var
		// oldChecksum=oldFileChecksum("F:/nginx-1.5.1/html/client-1000.js");

		// var
		// diffArray=searchChunk("F:/nginx-1.5.1/html/server.js",oldChecksum);
		HashMap<String, ArrayList<Integer>> oldChecksum = getOldMd5Map(oldFile,
				chunkSize);
		ArrayList<DiffItem> diffArray = searchChunk(newFile, oldChecksum,
				chunkSize);
		String arrayData = "";
		// var newData="";
		DiffItem lastitem = null;
		int matchCount = 0;
		int size = diffArray.size();

		for (int i = 0; i < size; i++) {

			DiffItem item = diffArray.get(i);
			// if(oldFile.indexOf("home")>0){
			// log("oldFile array:"+oldFile+" "+item.isMatch+" "+item.data);
			// }
			if (item.isMatch) {

				if (lastitem == null || !lastitem.isMatch) {
					arrayData = "[" + item.data + ",";
					matchCount = 1;
				} else if (lastitem.isMatch
						&& Integer.parseInt(lastitem.data) + 1 == Integer
								.parseInt(item.data)) {
					matchCount++;
				} else if (lastitem.isMatch
						&& Integer.parseInt((lastitem.data + 1)) != Integer
								.parseInt(item.data)) {
					arrayData += matchCount + "]";
					strDataArray.add(JSON.parse(arrayData));
					arrayData = "[" + item.data + ",";
					matchCount = 1;
				}
				if (i == (size - 1)) {
					arrayData += matchCount + "]";
					strDataArray.add(JSON.parse(arrayData));
					arrayData = "";
				}
			} else {
				if (matchCount > 0) {
					arrayData += matchCount + "]";
					strDataArray.add(JSON.parse(arrayData));
					arrayData = "";
					matchCount = 0;
				}
				// &quot;
				String data = item.data;
				// data=data.replace(/"/g, "&jsquot&&&;");
				strDataArray.add(data);
				// strData+="\"" +data +"\",";
			}
			lastitem = item;
		}
		// strData=strData.substr(0,strData.length-1);
		// strData+="]";
		// console.log("xxxsadfadfa"+strData);
		resultFile.put("data", strDataArray);
		return resultFile;
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

	public JSONObject makeIncDataFromFile(String oldFile, String newFile,
			int chunkSize) {
		String oldContent = readFile(oldFile, "utf-8");
		String newContent = readFile(newFile, "utf-8");
		return makeIncDataFile(oldContent, newContent, chunkSize);

	}

	public ChunkDiff() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ChunkDiff dUtil = new ChunkDiff();
		JSONObject json = dUtil
				.makeIncDataFromFile(
						"/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp/release/2014071500017/base-2014071500017.js",
						"/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp/release/2014071500016/base-2014071500016.js",
						12);        
		System.out.println(json.toJSONString());
	}

}
