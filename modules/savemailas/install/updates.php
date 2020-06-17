<?php
$updates["201108190000"][]="RENAME TABLE `go_links_9` TO `go_links_em_emails`;";
$updates["201108190000"][]="ALTER TABLE `go_links_em_emails` CHANGE `link_id` `model_id` INT( 11 ) NOT NULL";
$updates["201108190000"][]="ALTER TABLE `go_links_em_emails` CHANGE `link_type` `model_type_id` INT( 11 ) NOT NULL";

$updates["201108301656"][]="INSERT INTO `go_model_types` (
`id` ,
`model_name`
)
VALUES (
'9', 'GO_Savemailas_Model_LinkedEmail'
);";


$updates["201110110943"][]="RENAME TABLE `go_links_em_emails` TO `go_links_em_links` ;";
$updates["201110110943"][]="ALTER TABLE `em_links` CHANGE `link_id` `id` INT( 11 ) NOT NULL AUTO_INCREMENT";
$updates["201111101634"][]="ALTER TABLE `em_links` DROP `acl_write`";
$updates["201203300949"][]="ALTER TABLE `em_links` ADD `mtime` INT NOT NULL DEFAULT '0'";

$updates['201809031120'][]="UPDATE `core_entity` SET `name` = 'LinkedEmail', `clientName` = 'LinkedEmail' WHERE `name` = 'linkedEmail'";
