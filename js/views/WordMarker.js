"use strict";
define(['underscore',
        'jquery',
        'leaflet',
        'leaflet-markercluster',
        'leaflet.dom-markers'],
       function(_, $, L){
  /**
    The task of this module shall be to place a transcription marker on a leaflet map.
    It replaces the work formerly done by WordOverlay{View}.
    map :: L.map()
    data :: {
      altSpelling:        (tr !== null) ? tr.getAltSpelling() : ''
    , translation:        word.getNameFor(l)
    , latlng:             L.latlng
    , historical:         l.isHistorical() ? 1 : 0
    , phoneticSoundfiles: [{phonetic: String, soundfiles: [[String]]}]
    , langName:           l.getShortName()
    , languageLink:       'href="'+App.router.linkLanguageView({language: l})+'"'
    , familyIx:           l.getFamilyIx()
    , color:              proxyColor(l.getColor())
    , languageIx:         l.getId()
    }
  */
  return {
    'mkWordMarker': function(map, data){
      //Checking if data was already processed:
      if('marker' in data && 'content' in data){
        return data; // Don't process a second time.
      }
      //Generating the marker content:
      var content = _.map(data.phoneticSoundfiles, function(sf){
        //Building audioelements:
        var audio = '';
        if(sf.soundfiles.length > 0){
          audio = '<audio '
                + 'data-onDemand="' + JSON.stringify(sf.soundfiles) + '" '
                + 'autobuffer="" preload="auto"></audio>';
        }
        var fileMissing = ''; //Historical entries -> no files
        if(data.historical === 1 || audio === ""){
          fileMissing = ' fileMissing';
        }
        var smallCaps = (sf.phonetic === 'play')
                      ? ' style="font-variant: small-caps;"' : '';
        if(data.historical === 1){
          sf.phonetic = "*" + sf.phonetic;
        }
        return '<div style="display: inline;">'
             + '<div class="transcription' + fileMissing + '"'+smallCaps+'>'
             + sf.phonetic + '</div>'
             + audio+'</div>';
      }, this);
      content = content.join(',<br>');
      //Creating the div:
      var div = document.createElement('div')
        , $div = $(div).addClass('mapAudio', 'audio')
                       .html(content)
                       .css('background-color', data.color)
                       .attr('title', data.langName);
      //Adding a marker to the map:
      var icon = L.DomMarkers.icon({
        element: div,
        iconSize: L.point(40, 40)});
      //Add a way to fetch data from the icons options:
      icon.options.getData = function(){
        return data;
      };
      var marker = L.marker(data.latlng, {icon: icon});
      //Fixing the icon size when the marker is added:
      marker.on('add', function(){
        var w = 0, h = 0;
        $div.find('.transcription').each(function(){
          var t = $(this);
          w = Math.max(w, t.width());
          h += t.height();
        });
        //Fix size plus a tick:
        icon.options.iconSize = [Math.max(w+2, 40), Math.max(h+2, 40)];
        marker.setIcon(icon);
      });
      //Returning generated structures:
      return _.extend(data, {content: content, marker: marker});
    },
    /**
      This is a function that generates
      a cluster icon for several WordMarkers.
      cluster is described in
      https://github.com/Leaflet/Leaflet.markercluster#clusters-methods
    */
    'mkCluster': function(cluster){
      //div to embed into:
      var div = document.createElement('div')
        , $div = $(div)
        , w = 0, h = 0; // Sizes to calculate:
      _.each(cluster.getAllChildMarkers(), function(marker){
        var iOps = marker.options.icon.options;
        //Append icon to $div:
        $div.append(iOps.getData().content);
        //Updating size calculations:
        var size = iOps.iconSize;
        w = Math.max(w, size[0]);
        h += size[1];
      }, this);
      var cIcon = L.DomMarkers.icon({
        element: div,
        className: 'mapAudio',
        iconSize: L.point(w, h)});
      return cIcon;
    }
  };
});
