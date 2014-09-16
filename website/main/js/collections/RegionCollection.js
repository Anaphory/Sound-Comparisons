/***/
RegionCollection = Selection.extend({
  model: Region
  /**
    The update method is connected by the App,
    to listen on change:study of the window.App.dataStorage.
  */
, update: function(){
    var ds   = window.App.dataStorage
      , data = ds.get('study');
    if(data && 'regions' in data){
      console.log('RegionCollection.update()');
      this.reset(data.regions);
    }
  }
  /**
    @param languages [Language]
    Returns an object {rMap :: RegionId -> Region, lMap :: RegionId -> [Language]}
    This Method is basically a helper method for the MultiViews,
    and implements bucket sort, which runs in O(n), to sort Languages by Region.
  */
, getRegionBuckets: function(languages){
    var rMap = {}, lMap = {};
    _.each(languages, function(l){
      var r = l.getRegion(), rId = r.getId();
      if(!(rId in rMap)) rMap[rId] = r;
      (rId in lMap) ? lMap[rId].push(l) : lMap[rId] = [l];
    }, this);
    return {rMap: rMap, lMap: lMap};
  }
});
