package com.qq.storeinc;

import java.io.IOException;
import java.util.HashMap;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import com.qq.storeinc.DiffUtil;

/**
 * @author waynelu
 * mt js增量更新servlet,根据浏览上报上来的两个版本，
 * 计算出两个版本的增量文件并返回，如果没有老版本，
 * 则直接将新版本文件当做增量内容返回
 *
 */
public class StoreIncServlet extends HttpServlet {
	private static HashMap<String, String> fileContentCache =new HashMap<String,String>();
    /**
     * @see HttpServlet#HttpServlet()
     */
    public StoreIncServlet() {
        super();
        // TODO Auto-generated constructor stub
    }
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsPath=request.getRealPath("/");
		response.setContentType("application/x-javascript");
		  //编码
		response.setCharacterEncoding("utf-8");
		//块大小,这个要跟前端一致
        int chunkSize=12;
        //跨域头
		response.setHeader("Access-Control-Allow-Origin","*");
		//默认设置一个max-age，如果走cdn的话其实意义不大了
		response.setHeader("Cache-Control","max-age=86400");
		String url=request.getRequestURI();
		String[] pathArray=url.split("storeinc");
		url=pathArray[1];
		String fullName=url;
		//如果内存已经有处理过的内容，则直接返回
		if(fileContentCache.containsKey(fullName)){
    		String content=fileContentCache.get(fullName);
    		//设一个etag，如果走cdn的话其实意义不大了
    		String etag=String.valueOf(content.hashCode());
			response.setHeader("Etag",etag);
			response.getWriter().print(content);
			response.getWriter().close();
			return;
		}
	//将路径各个节点放入数组
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
       
			DiffUtil dUtil=new DiffUtil();
		     //如果是全量，则直接读入文件即可
			if(isFull){
            	String content=dUtil.readFile(fullFile, "utf-8");
            	if(!"".equals(content)){
            		fileContentCache.put(fullName,content);	
            	}
        		String etag=String.valueOf(content.hashCode());
    			response.setHeader("Etag",etag);
            	response.getWriter().print(content);
            }
			else{
				//如果是增量更新，则通过diffUtil类计算出增量更新文件
				JSONObject resultFile=dUtil.makeIncDataFromFile(oldFile, fullFile, chunkSize);
				String content=resultFile.toString();
            	if(!"".equals(content)){
            		fileContentCache.put(fullName, resultFile.toString());	
            	}
        		String etag=String.valueOf(content.hashCode());
    			response.setHeader("Etag",etag);
            	response.getWriter().print(content);
			}
		response.getWriter().close();

	}
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request,response);
	}
}
