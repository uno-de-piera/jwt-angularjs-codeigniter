<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Movies_model extends CI_Model 
{
	public function get()
	{
		return $this->db->select("*")->from("movies")->get()->result();
	}
}

/* End of file movies_model.php */
/* Location: ./application/models/movies_model.php */