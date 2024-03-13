import express, { response } from 'express';
import axios from 'axios';
import request from 'request';

const app = express();
const port = process.env.port||3000;

app.use(express.json());

const fetchData = async (url, method = 'get', data = null) => {
  try {
    const response = await axios({
      method,
      url,
      data,
    });

    return response.data; 
  } catch (error) {
    console.error(` Error fetching data from ${url}: ${error.message}`);
    throw error;
  }
};

app.post('/combinedData', async (req, res) => {
  try {
    const { Did_id, Earth_id, priv_key } = req.body.input;

    //  // Ensure all required parameters are provided
    //  if (!Did_id || !Earth_id || !priv_key) {
    //   return res.status(400).json({ error: 'Did_id, Earth_id, and priv_key are required parameters.' });
    //  }

    const api1Url = `https://stage-apiv2.myearth.id/user/getUser?earthId=${Earth_id} `;
    const api2Url = 'https://ssi-test.myearth.id/api/user/sign?issuerDID=did:earthid:testnet:2BEcvuahjF9r6LhfoebLWHEmAVkvjCza3VoM72bWfeAk;earthid:testnet:fid=0.0.3041406'
     
       // Fetch data from API1
    const data1 = await fetchData(api1Url);
    //  var  Did_id = "did:earthid:testnet:9hGovXTiBdqkbs8evaNbgXDzCPiiGb4QLbja9u5LczcJ;earthid:testnet:fid=0.0.3496238" ; 
    //  var Earth_id = '535939' ; 
    //  var priv_key ='Ad1P4GHPmxoxt9bhOrrCov6/5ciQwrcDPmmbWbT5j87pKFPvaQ/pmCq5Ch788iF+/9/hm/ZrxTzzWARjUMQfmg==' ; 
    const postData = {
      payload: {
        credentialSubject: {
          id: Did_id ,
          earthId: Earth_id ,
          firstname: data1.firstname, 
          lastname: data1.lastname ,
          email: data1.email,
          membershipType : "full"

        }
      }
    };
  
    const api2Response = await axios.post(api2Url, postData, {
      headers: {
        'X-API-KEY': '01a41742-aa8e-4dd6-8c71-d577ac7d463c',
        'privateKey':priv_key ,
        'Content-Type': 'application/json'
      }
    });

    const data2 = api2Response.data;

  //  Combine data

    const currentTimestamp = Date.now();
    const combinedData = { 
      earthId: data1.earthId,
      firstname: data1.firstname,
      lastname : data1.lastname,
      Signature : data2.Signature,
      "status" : "true",
      "TimeStamp" : currentTimestamp
    };
    res.json(combinedData);
    console.log(combinedData); 
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port , () => {
  console.log(`Server is running on http://localhost:${port}`);
});




    // Id in the payload shoould be the  (decentralised id genrating from the User )
    // Constant will do for now 
    // How should we get membership type? s it full for everyone?
    // We have to extract the data from theget user ?
    // How will we get the Id?


     //this is gonna be a Unique for every : user did will be in an input format 
       // earth id will be input format 
       // Private key will be input format 
       // all these three fields will come from RS sir work as variables 