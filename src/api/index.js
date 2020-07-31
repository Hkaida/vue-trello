import axios from 'axios';
import TMessage from "../components/TMessage/TMessage";

axios.defaults.baseURL = process.env.VUE_APP_SERVER_API_PATH;