<?php
  /***/
  function fetchTranslations_Regions($tid, $study, $offset){
    $descriptions = getDescriptions(array('dt_regions_regionGpNameShort','dt_regions_regionGpNameLong'), DB_CONNECTION);
    $values = array();
    $q = "SELECT CONCAT(StudyIx, FamilyIx, SubFamilyIx, RegionGpIx), RegionGpNameShort, RegionGpNameLong "
       . "FROM Regions_$study LIMIT ".PAGE_ITEM_LIMIT." OFFSET $offset";
    DB_CONNECTION->query($q);
    while($r = $set->fetch_row()){
      $entry = array(
        $tid      //'TranslationId'
      , 'Regions' //'TableSuffix'
      , $study    //'Study'
      , $r[0]     //'Key'
      , array(    //'Source'
          'RegionGpNameShort' => $r[1]
        , 'RegionGpNameLong'  => $r[2]
      ));
      $translation = array();
      $q = "SELECT Trans_RegionGpNameShort, Trans_RegionGpNameLong "
         . "FROM Page_DynamicTranslation_Regions "
         . "WHERE TranslationId = $tid AND Study = '$study' AND RegionIdentifier = '".$r[0]."'";
      if($t = DB_CONNECTION->query($q)->fetch_row()){
        $translation = array(
          'RegionGpNameShort' => $t[0]
        , 'RegionGpNameLong'  => $t[1]
        );
      }
      array_push($entry, $translation, $descriptions);
      array_push($values, $entry);
    }
    return $values;
  }
  /***/
  function saveTranslation_Regions($tid, $study, $key, $translation){
    $key = $key[0];
    $q = "DELETE FROM Page_DynamicTranslation_Regions "
       . "WHERE TranslationId = $tid AND Study = '$study' AND RegionIdentifier = '$key'";
    DB_CONNECTION->query($q);
    $a = $translation['RegionGpNameShort'];
    $b = $translation['RegionGpNameLong'];
    $q = "INSERT INTO Page_DynamicTranslation_Regions(TranslationId, Study, RegionIdentifier, "
       . "Trans_RegionGpNameShort, Trans_RegionGpNameLong) "
       . "VALUES ($tid, '$study', '$key', '$a', '$b')";
    DB_CONNECTION->query($q);
  }
?>
