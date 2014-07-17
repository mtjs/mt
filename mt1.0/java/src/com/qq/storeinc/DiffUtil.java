package com.qq.storeinc;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;




/**
 * @author waynelu 计算两个文件之间的增量，并返回增量文件
 */
public class DiffUtil {
	//每个diffItem
	class DiffItem {
		private boolean isMatch;//是不是能找到一样的数据块
		private String data;//如果是新数据直接是一个字符串，如果是老数据则，记住块号

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

		@Override
		public String toString() {
			return "DiffItem [isMatch=" + isMatch + ", data=" + data + "]";
		}

	}

	/**
	 * md5计算方法
	 * @param s 源参数
	 * @return
	 */
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

	/**
	 * 获取老版本文件的数据的md5,数据块map,
	 * 其中key是块的md5值，value是该md5值的所有数据块号
	 * @param txt 文件内容
	 * @param chunkSize 块长度
	 * @return
	 */
	public HashMap<String, ArrayList<Integer>> getOldMd5Map(String txt,
			int chunkSize) {
		//循环切割数据，计算md5，放入map
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
			currentIndex = currentIndex + chunkSize;
			chunkNo++;
		}
		return md5Map;

	}

	/**
	 * 从一个匹配的块号序列里面获取离上一个匹配的块号最近的块好
	 * ，有利于压缩数据
	 * @param numArray
	 * @param lastmatchNo
	 * @return
	 */
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

	/**
	 * 获取某个md5值的匹配块号，如果没有返回-1
	 * @param chunkMd5
	 * @param checksumArray
	 * @param lastmatchNo
	 * @return
	 */
	private int checkMatchIndex(String chunkMd5,
			HashMap<String, ArrayList<Integer>> checksumArray, int lastmatchNo) {
		ArrayList<Integer> numArray = checksumArray.get(chunkMd5);
		if (numArray == null) {
			return -1;
		} else {
			return getMatchNo(numArray, lastmatchNo);
		}
	}

	/**
	 * 如果是新数据把新数据放入最终队列里面
	 * @param incDataArray
	 * @param data
	 */
	private void doExactNewData(ArrayList<DiffItem> incDataArray, String data) {
		DiffItem di = new DiffItem(false, data);
		incDataArray.add(di);
	}

	/**
	 * 如果是老数据，则将匹配块号发放到最终队列里面
	 * @param incDataArray
	 * @param chunkNo
	 */
	private void doExactMatch(ArrayList<DiffItem> incDataArray, String chunkNo) {

		DiffItem di = new DiffItem(true, chunkNo);
		incDataArray.add(di);
	}

	/**
	 *用新版文件内容在老板内容的map里面滚动查找，生成一个增量更新文件的map
	 * @param strInput
	 * @param checksumArray
	 * @param chunkSize
	 * @return
	 */
	private ArrayList<DiffItem> searchChunk(String strInput,
			HashMap<String, ArrayList<Integer>> checksumArray, int chunkSize) {

		ArrayList<DiffItem> incDataArray = new ArrayList<DiffItem>();
		// chunk
		String buffer = null;

		String outBuffer = "";

		int currentIndex = 0;
		int tLen = strInput.length();
		int lastmatchNo = 0;
		while (currentIndex < tLen) {
			int endIndex = currentIndex + chunkSize;
			if (endIndex > tLen) {
				endIndex = tLen;
			}
			//截取一个块，计算md5,查找匹配块
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

	/**根据文件内容 生成增量更新json
	 * @param oldFile
	 * @param newFile
	 * @param chunkSize
	 * @return
	 */
	public JSONObject makeIncDataFile(String oldFile, String newFile,
			int chunkSize) {
		JSONObject resultFile = new JSONObject();
		try {
			resultFile.put("modify", true);
		resultFile.put("chunkSize", chunkSize);
		} catch (JSONException e1) {
			// TODO Auto-generated catch block

		}
		JSONArray strDataArray = new JSONArray();
		if (MD5(oldFile).equals(MD5(newFile))) {
			try {
				resultFile.put("modify", false);
				resultFile.put("data", strDataArray);
			} catch (JSONException e) {

			}
			return resultFile;
		}
		HashMap<String, ArrayList<Integer>> oldChecksum = getOldMd5Map(oldFile,
				chunkSize);
		ArrayList<DiffItem> diffArray = searchChunk(newFile, oldChecksum,
				chunkSize);
		String arrayData = "";
		DiffItem lastitem = null;
		int matchCount = 0;
		int size = diffArray.size();
		//生成json，同时合并连续命中的块，压缩数据
		for (int i = 0; i < size; i++) {
			DiffItem item = diffArray.get(i);
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
	
					try {
						strDataArray.put(new JSONArray(arrayData));
					} catch (JSONException e) {

					}
					arrayData = "[" + item.data + ",";
					matchCount = 1;
				}
				if (i == (size - 1)) {
					arrayData += matchCount + "]";

					try {
						strDataArray.put( new JSONArray(arrayData));
					} catch (JSONException e) {
						// TODO Auto-generated catch block

					}
					arrayData = "";
				}
			} else {
				if (matchCount > 0) {
					arrayData += matchCount + "]";
					
					try {
						strDataArray.put(new JSONArray(arrayData));
					} catch (JSONException e) {
						// TODO Auto-generated catch block

					}
					arrayData = "";
					matchCount = 0;
				}
				String data = item.data;
				strDataArray.put(data);

			}
			lastitem = item;
		}

		try {
			resultFile.put("data", strDataArray);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return resultFile;
	}

	/**
	 * 读取够格文件内容
	 * @param file
	 * @param encode
	 * @return
	 */
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

	/**
	 * 根据新旧版文件名和块大小生成增量更新json对象
	 * @param oldFile
	 * @param newFile
	 * @param chunkSize
	 * @return
	 */
	public JSONObject makeIncDataFromFile(String oldFile, String newFile,
			int chunkSize) {
		String oldContent = readFile(oldFile, "utf-8");
		String newContent = readFile(newFile, "utf-8");
		return makeIncDataFile(oldContent, newContent, chunkSize);

	}

	public DiffUtil() {
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		DiffUtil dUtil = new DiffUtil();
		JSONObject json = dUtil
				.makeIncDataFromFile(
						"E:/newworkspace/webapp_infocdn/js/info/infoapp/autolib/2013111900010/page/home-2013111900010.js",
						"E:/newworkspace/webapp_infocdn/js/info/infoapp/autolib/2013111900017/page/home-2013111900017.js",
						12);
		System.out.println(json.toString());
	}

}
