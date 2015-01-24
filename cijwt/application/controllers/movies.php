<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Movies extends CI_Controller {

	protected $headers;

	public function __construct()
	{
		parent::__construct();
		$this->headers = apache_request_headers();
	}

	public function index()
	{
		if(!isset($this->headers["Authorization"]) || empty($this->headers["Authorization"]))
		{
			//mejorar la validación, pero si está aquí es que no tenemos el token
		}
		else
		{
			$token = explode(" ", $this->headers["Authorization"]);
			$user = JWT::decode(trim($token[1],'"'));
			$this->load->model("auth_model");

			if($this->auth_model->checkUser($user->id, $user->email) !== false)
			{
				$this->load->model("movies_model");
				$movies = $this->movies_model->get();
				$user->iat = time();
				$user->exp = time() + 300;
				$jwt = JWT::encode($user, '');
				echo json_encode(
					array(
						"code" => 0, 
						"response" => array(
							"token" => $jwt,
							"movies"=> $movies
						)
					)
				);
			}

		}
	}
}

/* End of file movies.php */
/* Location: ./application/controllers/movies.php */