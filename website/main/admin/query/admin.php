<?php
  chdir('..');
  require_once 'common.php';
  /* Checking for edit rights: */
  if(!session_mayEdit($dbConnection))
    die('You are not allowed to access this feature.');
  /* Ensuring an action is given: */
  if(!isset($_GET['action']))
    die('Missing get parameter:action!');
  /* Dealing with the action: */
  switch($_GET['action']){
    /* Parameters: username, password, mayTranslate, mayEdit */
    case 'create':
      $username     = $dbConnection->escape_string($_POST['username']);
      $password     = md5($_POST['password']);
      $mayTranslate = $dbConnection->escape_string($_POST['mayTranslate']);
      $mayEdit      = $dbConnection->escape_string($_POST['mayEdit']);
      /* Sanitizing permissions: */
      if($mayTranslate != '1')
        $mayTranslate = '0';
      if($mayEdit != '1')
        $mayEdit = '0';
      /* Checking that username is not taken: */
      $q = "SELECT COUNT(*) FROM Edit_Users WHERE Login = '$username'";
      $r = $dbConnection->query($q)->fetch_row();
      if($r[0] > 0) die("Login '$username' already taken.");
      /* Inserting new user: */
      $q = "INSERT INTO Edit_Users(Login, Hash, AccessEdit, AccessTranslate) "
         . "VALUES ('$username','$password',$mayEdit,$mayTranslate)";
      $dbConnection->query($q);
      echo 'OK';
    break;
    /* Parameters: userid, login, password, mayTranslate, mayEdit */
    case 'update':
      if(!isset($_POST['userid'])) die('userid missing!');
      $userid = $dbConnection->escape_string($_POST['userid']);
      if(isset($_POST['login'])){
        $login = $dbConnection->escape_string($_POST['login']);
        /* Ensuring no other user has the given login: */
        $q = "SELECT COUNT(*) FROM Edit_Users WHERE UserId != $userid AND Login = '$login'";
        $r = $dbConnection->query($q)->fetch_row();
        if($r[0] == 0){
          /* Updating the Login: */
          $q = "UPDATE Edit_Users SET Login = '$login' WHERE UserId = $userid";
          $dbConnection->query($q);
          echo "Updated login name.\n";
        }
      }
      if(isset($_POST['password']))
        if($_POST['password'] != ''){
          $password = md5($_POST['password']);
          $q = "UPDATE Edit_Users SET Hash = '$password' WHERE UserId = $userid";
          $dbConnection->query($q);
          echo "Updated password.\n";
      }
      if(isset($_POST['mayTranslate'])){
        $mayT = $dbConnection->escape_string($_POST['mayTranslate']);
        if($mayT != '1') $mayT = '0';
        $q = "UPDATE Edit_Users SET AccessTranslate = $mayT WHERE UserId = $userid";
        $dbConnection->query($q);
        echo "Updated translation access.\n";
      }
      if(isset($_POST['mayEdit'])){
        $mayE = $dbConnection->escape_string($_POST['mayEdit']);
        if($mayE != '1') $mayE = '0';
        $q = "UPDATE Edit_Users SET AccessEdit= $mayE WHERE UserId = $userid";
        $dbConnection->query($q);
        echo "Updated edit access.\n";
      }
    break;
    /* Parameters: userid */
    case 'delete':
      $userid = $dbConnection->escape_string($_POST['userid']);
      /* Checking that the user won't delete itself: */
      if($userid == session_getUid()) die("You cannot delete yourself, sorry.");
      /* Deleting the user: */
      $q = "DELETE FROM Edit_Users WHERE UserId = $userid";
      $dbConnection->query($q);
      echo "Deleted user: $userid";
    break;
    default: die('Call to unsupported action.');
  }
?>
