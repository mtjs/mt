package com.storeinc;

import java.io.IOException;



import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

/**
 * 计算storeinc两个版本之间的增量文件.
 * Servlet implementation class StoreIncServlet.
 */
public class StoreIncServlet extends HttpServlet {
	//内容缓存
	private static ConcurrentHashMap<String, String> fileContentMap=new ConcurrentHashMap<String, String>();

	private static final long serialVersionUID = 1L;
    private String jsPath;
    private int chunkSize;
    private String diffAlg;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public StoreIncServlet() {
        super();
        // TODO Auto-generated constructor stub
    }
    public void init(ServletConfig config) throws ServletException{
        this.jsPath=config.getInitParameter("jsPath");
        this.chunkSize=Integer.parseInt(config.getInitParameter("chunkSize"));
        this.diffAlg=config.getInitParameter("diffAlg");
    }
    

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Content-Type","application/x-javascript");
		response.setHeader("Access-Control-Allow-Origin","*");
		response.setCharacterEncoding("utf-8");
		String url=request.getRequestURI();
		//System.out.println(this.diffAlg);

		String[] pathArray=url.split("storeinc");
		url=pathArray[1];
		String fullName=url;
		//如果内存已经有处理过的内容，则直接返回
		if(fileContentMap.containsKey(fullName)){
			response.getWriter().print(fileContentMap.get(fullName));
			response.getWriter().close();
			return;
		}
		//System.out.println("sssssss:"+url);
		ArrayList<String> fileList=getFileArray(url);
		String baseDir=getBaseDir(url);
		 JSONArray iArray = new JSONArray();
		for(int i=0;i<fileList.size();i++){
		//System.out.println("ssssssssssee:"+url);
			//url=fileList.get(i);
			String js=fileList.get(i);
			url=baseDir+js;
			//System.out.println("ssssssssssee:"+url);
			String[] urlArray=url.split("/");
			int len=urlArray.length;
			String pathName="";
			String lastver="";
			String ver="";
			String jsFileName="";
			String verStr="";
			boolean isFull=false;
			if(len>=2){
				//获取最终文件名 name-ver1_ver2.js的形式
				String filename=urlArray[len-1];
				pathName=url.replace(filename, "");
				String[] sArray=filename.split("-");
				try{
				jsFileName=sArray[0];
				verStr=sArray[1];
				}
				catch(Exception ex){
	               System.out.print("exception ex:"+ex.toString());
				}
				//包含_说明请求的是增量文件
				if(verStr.contains("_")){
					String[] verArray=verStr.split("_");
					lastver=verArray[0];
					ver=verArray[1].replace(".js","");
				}
				else{
					ver=verStr.replace(".js","");
					isFull=true;
				}
			}
	            //分别获取新版和老版文件路径名

				String fullFile=jsPath+"/"+pathName+"/"+jsFileName+"-"+ver+".js";
	            String oldPath=pathName.replace(ver,lastver);
				String oldFile=jsPath+"/"+oldPath+"/"+jsFileName+"-"+lastver+".js";
				//System.out.println(oldFile);
				//System.out.println(fullFile);
	           //如果是全量
				DiffUtil dUtil=new DiffUtil();
				if(isFull){
	            	String fullContent=dUtil.readFile(fullFile, "utf-8");
	        		JSONObject resultFile = new JSONObject();
	        		resultFile.put("modify", true);
	        		// resultFile.modify=true;
	        		resultFile.put("chunkSize",12);
	        		resultFile.put("diffAlg", this.diffAlg);
	        		resultFile.put("inc", false);
	        		resultFile.put("data", fullContent);
	        		resultFile.put("js", js);
	        		//  resultFile.js=fileitem.file;
	        		iArray.add(resultFile);
	            	//response.getWriter().print(fullContent);
	            }
				else{
				
					if(!"lcs".equals(this.diffAlg)){
					
						JSONObject resultFile=dUtil.makeIncDataFromFile(oldFile, fullFile, this.chunkSize);
						resultFile.put("js", js);
						resultFile.put("inc", true);
						//fileContentMap.put(fullName, resultFile.toJSONString());
						iArray.add(resultFile);
						//response.getWriter().print(resultFile.toJSONString());
					}
					else{
						LcsDiff lcfDiff = new LcsDiff();
						JSONObject resultFile=lcfDiff.makeIncDataFromFile(oldFile, fullFile);
						resultFile.put("js", js);
						resultFile.put("inc", true);
						//fileContentMap.put(fullName, resultFile.toJSONString());
						iArray.add(resultFile);
						//System.out.println();
						//response.getWriter().print(resultFile.toJSONString());
					}
			
				}

		}
		fileContentMap.put(fullName, iArray.toJSONString());
		if(iArray.size()>0){
			response.getWriter().print(iArray.toJSONString());
		}
		else{
			response.setStatus(404);	
			response.getWriter().print("");
		}
	
		//response.getWriter().print("s:"+url+" "+pathName+" "+lastver+" "+ver+" "+jsFileName);
		response.getWriter().close();
		
		
		// TODO Auto-generated method stub
	}
    private ArrayList<String> getFileArray(String fileUrl){
    	//System.out.println("aaaaaaxx:"+fileUrl);
    	ArrayList<String> reList=new ArrayList<String>();
    	String[] s=fileUrl.split(",");
    	//String baseDir=s[0];
    	for(int i=1;i<s.length;i++){
    		//System.out.println("aaaaaa:"+s[i]);
    		reList.add(s[i]);
    	}
    	return reList;
    	
    }
    private String getBaseDir(String fileUrl){
    	String[] s=fileUrl.split(",");
    	String baseDir=s[0];
    	return baseDir;
    }
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request,response);
		// TODO Auto-generated method stub
	}

}
