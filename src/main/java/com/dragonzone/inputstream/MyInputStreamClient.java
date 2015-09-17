package com.dragonzone.inputstream;

import java.io.FileInputStream;
import java.io.InputStream;

public class MyInputStreamClient {

	public static void main(String[] args) throws Exception {
      
      InputStream is = null;
      int len = 512;
      byte[] buffer=new byte[len];
      char c;
      
      try{
         // new input stream created
         is = new FileInputStream("C:/temp/andy.log");
         
         System.out.println("Characters printed:");
         
         byte[] bt = new byte[1];
         bt[0] = (byte)is.read();
         System.out.println(new String(bt));
//         byte b = (byte)is.read();
//         System.out.println(b);
      }catch(Exception e){
         
         // if any I/O error occurs
         e.printStackTrace();
      }finally{
         
         // releases system resources associated with this stream
         if(is!=null)
            is.close();
      }
   }
}
