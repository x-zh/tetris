<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tetris";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if(isset($_POST['username'])){
    if(!empty($_POST['username'])){
        $sql = "INSERT INTO user_score (username, score) VALUES ('" . $_POST['username'] . "', " . $_POST['score'] . ")";
        $conn->query($sql);
    }
} else {
    $sql = "SELECT * FROM user_score ORDER BY score DESC;";
    $result = $conn->query($sql);
    $arr = array();

    // output data of each row
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            array_push($arr,
                       array(
                            "username" => $row["username"],
                            "score" => $row["score"],
                            "datetime" => $row["datetime"]
                        ));
        }
    }
    echo json_encode($arr);
}

$conn->close();
exit;
