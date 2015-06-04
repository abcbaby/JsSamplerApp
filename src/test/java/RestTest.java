/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.client.RestTemplate;

import com.dragonzone.testapp.Post;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"/applicationContext.xml"})
public class RestTest {

//    @Autowired
    RestTemplate restTemplate = new RestTemplate();

    public RestTest() {
    }

    @BeforeClass
    public static void setUpClass() {
        System.setProperty("http.proxyHost", "firewall");
        System.setProperty("http.proxyPort", "80");
    }

    @AfterClass
    public static void tearDownClass() {
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

//    @Test
    public void testSpringREST() {
//        HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
//        DefaultHttpClient httpClient = (DefaultHttpClient) requestFactory.getHttpClient();
//        HttpHost proxy = new HttpHost("firewall", 80);
//        httpClient.getParams().setParameter(ConnRoutePNames.DEFAULT_PROXY, proxy);
//        restTemplate.setRequestFactory(requestFactory);

        String baseURL = "http://jsonplaceholder.typicode.com";
        int id = 5;
        int userId = 3;
        String obj = restTemplate.getForObject(baseURL + "/posts/{id}", String.class, id);
        Post doc = restTemplate.getForObject(baseURL + "/posts/{id}", Post.class, id);
        Post[] posts = restTemplate.getForObject(baseURL + "/posts?userId={userId}", Post[].class, userId);
        List<Post> postList = Arrays.asList(posts);
        System.out.println("done");
    }
    
    @Test
    @Ignore
    public void testLocalRest() {
        String id = "dawn";
        String baseURL = "http://localhost:8888/rest";
        Post doc = restTemplate.getForObject(baseURL + "/post/{id}", Post.class, id);
        System.out.println("done");
    }
    
    @Test
    public void testFile() {
    	System.out.println("abc");
    	String alertMessagePath = "C:/opt/data1/afi/alert-message.txt";
    	try {
        	String alertMesg = new String(Files.readAllBytes(Paths.get(alertMessagePath)));
        	System.out.println("ado msg: " + alertMesg);
    	} catch (IOException e) {
    		e.printStackTrace();
    	}
    }
}
