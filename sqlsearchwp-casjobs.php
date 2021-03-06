<?php
/*
Plugin Name: SQLSearchWP CasJobs
Plugin URI: http://www.voyages.sdss.org
Description: Query Casjobs
Version: 1.0.0
Author: Bonnie Souter, William Harrington
Author URI: https://github.com/bonbons0220
License: MIT
*/

// Only allow this script to be run within WordPress
defined('ABSPATH') or die("Unknown Access Error");

define( 'SQLS_DIR_PATH' , plugin_dir_path( __FILE__ ) );
define( 'SQLS_DIR_URL' , plugin_dir_url( __FILE__ ) );
define( 'SQLS_DEVELOP' , TRUE );

// load the class file
require_once( SQLS_DIR_PATH . 'lib/sqlsearchwp-casjobs.php' );

// Let's roll!
sqlswp_plugin();
