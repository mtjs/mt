<?php
	/*
		增量更新 php版
		by markshang
		2014-01-16 15:33
	*/
	/*
		配合前端的js请求格式 /storeinc/xxx/jsfile-oldver_newver.js
		直接请求php格式为 storeinc.php?file=/xxx/jsfile-oldver_newver.js
		apache 配置如下
		RewriteEngine on 
		RewriteRule aaa/(.*)$ /demo/$1
		RewriteRule storeinc/(.+).js$ storeinc.php?file=$1
	*/
	header("Content-Type: application/x-javascript; charset=UTF-8");
	header("Access-Control-Allow-Origin: *");
	header("Cache-Control: max-age=86400");

	class DiffItem {
		public $isMatch = false;
		public $data = "";
		function __construct($m, $dt) {
			$this->isMatch = $m;
			$this->data = $dt;
		}
		function __toString() {
			return "DiffItem [isMatch=$isMatch, data=$data]";
		}
	}
	
	class DiffUtil {
		private function MD5($s) {
			return md5($s);
		}
		
		public function getOldMd5Map($txt, $chunkSize) {
			$md5Map = array();
			$currentIndex = 0;
			$len = mb_strlen($txt);
			$chunkNo = 0;
			$end = 0;
			while($currentIndex < $len) {
				//echo("currentIndex::$currentIndex\n");
				$end = $currentIndex + $chunkSize;
				if ($end > $len) {
					$end = $len;
				}
				$chunk = mb_substr($txt, $currentIndex, $end-$currentIndex);
				$chunkMd5 = $this->MD5($chunk);
				//echo("chunk/md5::$chunk || $chunkMd5\n");
				$numArray = $md5Map[$chunkMd5];
				if (empty($numArray)) {
					$numArray = array();
				}
				array_push($numArray, $chunkNo);
				$md5Map[$chunkMd5] = $numArray;
				$currentIndex = $currentIndex + $chunkSize;
				$chunkNo++;
			}
			return $md5Map; 
		}
		
		private function getMatchNo(&$numArray, $lastMatchNo){
			if (count($numArray) == 1) {
				return $numArray[0];
			}else{
				$lastNo = $numArray[0];
				$reNo = 0;
				foreach($numArray as $i => $curNo) {
					if ($curNo >= $lastMatchNo && $lastNo <= $lastMatchNo) {
						return ($lastmatchNo - $LastNo) >= ($curNo - $lastmatchNo) ? $curNo : $lastNo;
					}else if ($curNo >= $lastmatchNo && $lastNo >= $lastmatchNo) {
						return $lastNo;
					}else if ($curNo <= $lastmatchNo && $lastNo <= $lastmatchNo) {
						$reNo = $curNo;
					}
					$lastNo = $curNo;
				}
				return $reNo;
			}
		}
		
		private function checkMatchIndex($chunkMd5, &$checksumArray, $lastmatchNo) {
			//var_dump($checksumArray);
			$numArray = $checksumArray[$chunkMd5];
			if (empty($numArray)) {
				return -1;
			}else {
				return $this->getMatchNo($numArray, $lastmatchNo);
			}
		}
		
		private function doExactNewData(&$incDataArray, $data) {
			$di = new DiffItem(false, $data);
			//echo("di:");
			//var_dump($di);
			array_push($incDataArray, $di);
			//echo("after array_push::\n");
			//var_dump($incDataArray);
			//echo("doExactNewData:: $data\n");
		}
		
		private function doExactMatch(&$incDataArray, $chunkNo) {
			$di = new DiffItem(true, $chunkNo);
			array_push($incDataArray, $di);
		}
		
		private function searchChunk($strInput, &$checksumArray, $chunkSize) {
			$incDataArray = array();
			$buffer = "";
			$outBuffer = "";
			
			$currentIndex = 0;
			$tLen = mb_strlen($strInput);
			$lastmatchNo = 0;
			//var_dump($checksumArray);
			//fixme:: java版这里是<= 1!!!
			while($currentIndex < $tLen) {
				//echo("currentIndex::$currentIndex\n");
				$endIndex = $currentIndex + $chunkSize;
				if ($endIndex > $tLen) {
					$endIndex = $tLen;
				}
				
				$buffer = mb_substr($strInput, $currentIndex, $endIndex-$currentIndex);
				//echo("buffer::$buffer\n");
				$chunkMd5 = $this->MD5($buffer);
				//echo("chunkMd5::$chunkMd5\n");
				//var_dump($checksumArray);
				$matchTrunkIndex = $this->checkMatchIndex($chunkMd5, $checksumArray, $lastmatchNo);
				//echo("matchTrunkIndex::$matchTrunkIndex\n");
				if ($endIndex > $tLen -1) {
					//echo("outBufferLength::".count($outBuffer)."::".!empty($outBuffer)."\n");
					if ((count($outBuffer) > 0) && (!empty($outBuffer))) {
						$this->doExactNewData($incDataArray, $outBuffer);
					}
					if (count($buffer) > 0 && (!empty($buffer))) {
						$this->doExactNewData($incDataArray, $buffer);
					}
					
					$currentIndex = $currentIndex + $chunkSize;
				}else if ($matchTrunkIndex >= 0) {
					if (count($outBuffer) > 0 && !empty($outBuffer)) {
						$this->doExactNewData($incDataArray, $outBuffer);
						$outBuffer = "";
					}
					$this->doExactMatch($incDataArray, $matchTrunkIndex);
					$currentIndex = $currentIndex + $chunkSize;
				}else {
					$outBuffer = $outBuffer . mb_substr($strInput, $currentIndex, 1);
					//echo("outBuffer::$outBuffer\n");
					$currentIndex++;
				}
				
				if ($matchTrunkIndex >= 0) {
					$lastmatchNo = $matchTrunkIndex;
				}
			}
			//echo("#incDataArray\n");
			//var_dump($incDataArray);
			return $incDataArray;
		}
		
		public function makeIncDataFile($oldFile, $newFile, $chunkSize) {
			$resultFile = array();
			$resultFile["modify"] = true;
			$resultFile["chunkSize"] = $chunkSize;
			$strDataArray = array();
			if (MD5($oldFile) == $this->MD5($newFile)) {
				$resultFile["modify"] = false;
				$resultFile["data"] = $strDataArray;
				return $resultFile;
			}
			$oldCheckSum = $this->getOldMd5Map($oldFile, $chunkSize);
			//var_dump($oldCheckSum);
			$diffArray = $this->searchChunk($newFile, $oldCheckSum, $chunkSize);
			//echo("#####\n");
			//var_dump($diffArray);
			$arrayData = array();
			$lastitem = null;
			$matchCount = 0;
			$size  = count($diffArray);
			foreach($diffArray as $i => $item) {
				//echo("matchCount::$lastitem->isMatch::$matchCount::$item->isMatch::"  . ($lastitem->data+1) . "::$item->data\n");
				if($item->isMatch) {
					if(empty($lastitem) || !$lastitem->isMatch) {
						//echo(gettype($arrayData));
						array_push($arrayData, $item->data);
						$matchCount = 1;
					}else if ($lastitem->isMatch && (((int)$lastitem->data + 1) == (int)$item->data)) {
						$matchCount++;
					}else if ($lastitem->isMatch && (((int)$lastitem->data + 1) != (int)$item->data)) {
						array_push($arrayData,$matchCount);
						//echo(gettype($arrayData));
						array_push($strDataArray, $arrayData);
						$arrayData = array();
						array_push($arrayData,$item->data);
						$matchCount = 1;
					}
					
					if ($i == ($size-1)) {
						array_push($arrayData, $matchCount);
						var_dump($arrayData);
						array_push($strDataArray, $arrayData);
						$arrayData = array();
					} 
				}else {
					if ($matchCount > 0) {
						array_push($arrayData, $matchCount);
						array_push($strDataArray, $arrayData);
						$arrayData = array();
						$matchCount = 0;
					}
					$data = $item->data;
					array_push($strDataArray, $data);
				}
				
				$lastitem = $item;
			}
			
			$resultFile["data"] = $strDataArray;
			return $resultFile;
		}
		
		public function readFile($file) {
			return file_get_contents($file);
		}
		
		public function makeIncDataFromFile($oldFile, $newFile, $chunkSize) {
			$oldFileContent = "";
			$newFileContent = "";
			//echo("xxx\n");
			//echo("oldFile::file_exists($oldFile)\n");
			if (file_exists($oldFile)) {
				$oldFileContent = $this->readFile($oldFile);
			}
			//echo("newFile::file_exists($newFile)\n");
			if (file_exists($newFile)) {
				$newFileContent = $this->readFile($newFile);
			}
			return $this->makeIncDataFile($oldFileContent, $newFileContent, $chunkSize);
		}
		
	}
	
	//暂时不加cache
	function getPaths () {
		// 从请求参数映射到对应的真实文件
		$rootPath = $_SERVER["DOCUMENT_ROOT"];
		$jsPath = $_GET["file"];
		$chunkSize = 12;
		//url = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'] . '?' . $_SERVER['QUERY_STRING'];
		$jsPathArr = array_diff(explode("/", $jsPath), array(""));
		//var_dump($jsPathArr);

		$fileName = end($jsPathArr);
		array_pop($jsPathArr);
		$pathName = join("/", $jsPathArr);
		$sArray = explode("-", $fileName);
		$jsFileName = $sArray[0];
		$verStr = $sArray[1];
		//echo("verStr:: $verStr\n");
		$verArray = explode("_", $verStr);
		//var_dump($verArray);
		$verArrayLen = count($verArray);
		$lastver = "";
		$ver = "";
		$isFull = false;
		if ($verArrayLen > 1) {
			$lastver = $verArray[0];
			$ver = str_replace(".js", "", $verArray[1]);
		}else{
			$ver = str_replace(".js", "", $verArray[0]);
			$isFull = true;
		}
		//echo("ver:: $ver\n");
		$fullFile = "$rootPath/$pathName/$jsFileName-$ver.js";
		$oldFile = "$rootPath/" . str_replace($ver, $lastver, $pathName) . "/$jsFileName-$lastver.js";
		//echo("fullFile:: $fullFile\n");
		//echo("oldFile:: $oldFile\n");
		return array($fullFile, $oldFile, $isFull);
	}
	
	function doInc($fullFile, $oldFile, $isFull, $chunkSize) {
		$dUtil = new DiffUtil();
		//echo("isFull::$isFull\n");
		if ($isFull) {
			if (file_exists($fullFile)) {
				$content = $dUtil->readFile($fullFile);
				echo($content);
			}else{
				header('HTTP/1.1 404 Not Found');
				echo("not found!");
			}
		}else{
			if (file_exists($fullFile)) {
				$resultFile = $dUtil->makeIncDataFromFile($oldFile, $fullFile, $chunkSize);
				//var_dump($resultFile);
				$content = json_encode($resultFile);
				echo($content);
			}else{
				header('HTTP/1.1 404 Not Found');
				echo("not found!");
			}
		}
	}
	
	list($newFile, $oldFile, $isFull) = getPaths();
	doInc($newFile, $oldFile, $isFull, 12);
	
	 //echo("newFile: $newFile\n");
	 //echo("oldFile: $oldFile\n");
	// echo("isFull: $isFull\n");
?>