/**
  The WordMenuView will be used by the Renderer.
  It will set it's own model and handle it similar to TopMenuView.
*/
WordMenuView = Backbone.View.extend({
  initialize: function(){
    //Setting the initial model:
    this.model = {
      searchFilter: {
        fClearAllLink: function(){
          return 'data-href="'+App.router.linkCurrent({words: []})+'"';
        }
      }
    };
  }
  /**
    Executes non /^update.+/ methods the first time and configures their callbacks.
  */
, activate: function(){
    //Setting callbacks to update model:
    App.translationStorage.on('change:translationId', this.buildStatic, this);
    App.dataStorage.on('change:global', this.buildSoundPath, this);
    //Building statics the first time:
    this.buildStatic();
    this.buildSoundPath();
  }
  /**
    Generates the static translation part for the WordMenu.
  */
, buildStatic: function(){
    var staticT = App.translationStorage.translateStatic({
      title:       'menu_words_words'
    , meaningSets: 'menu_words_meaningSets_title'
    , expand:      'menu_words_meaningSets_expand'
    , collapse:    'menu_words_meaningSets_collapse'
    , sortBy: {
        sortBy: 'menu_words_selectortext'
      , aOrder: 'menu_words_selector_rfclangs'
      , lOrder: 'menu_words_sortelicitation'
      }
    , searchFilter: {
        sfby:             'menu_words_filter_head'
      , spelling:         'menu_words_filterspelling'
      , phonetics:        'menu_words_filterphonetics'
      , soundFile:        'menu_words_filter_fonetics_file'
      , fonetics:         'menu_words_filter_fonetics'
      , psTarget:         'menu_words_filter_regex_link'
      , psHover:          'menu_words_filter_regex_hover'
      , in:               'menu_words_filter_spphin'
      , ipaOpenTitle:     'menu_words_open_ipaKeyboard'
      , filterFoundWords: 'menu_words_filterFoundWords'
      , fTitle:           'menu_words_filterTitleMultiWords'
      , fAddAll:          'menu_words_filterAddMultiWords'
      , fRefresh:         'menu_words_filterRefreshMultiWords'
      , fClearAll:        'menu_words_filterClearAllWords'
      }
    });
    this.setModel(staticT);
  }
  /**
    Generates the soundPath part of the model for WordMenuView.
  */
, buildSoundPath: function(){
    var path = '';
    if(g = App.dataStorage.get('global')){
      if('global' in g && 'soundPath' in g.global){
        path = g.global.soundPath;
      }
    }
    this.setModel({searchFilter: {soundPath: path}});
  }
  /**
    Generates the sortBy part of the model for WordMenuView.
  */
, updateSortBy: function(){
    var data = {
      isLogical: App.pageState.wordOrderIsLogical()
    };
    data.link = data.isLogical ? App.router.linkConfig({WordOrderAlphabetical: []})
                               : App.router.linkConfig({WordOrderLogical: []});
    data.link = 'data-href="'+data.link+'"';
    this.setModel({sortBy: data});
  }
  /**
    Since big parts of the searchFilter are already done by updateStatic,
    this method has a focus on building the {sp,ph}List entries.
  */
, updateSearchFilter: function(){
    var data = {spList: {}, phList: {}};
    //Filling spList:
    var spLang = App.pageState.getSpLang();
    data.spList.current = spLang ? spLang.getSpellingName() : App.translationStorage.getName();
    //First item:
    if(spLang){
      data.spList.options = [{
        link: 'data-href="'+App.router.linkConfig({SpLang: spLang})+'"'
      , name: App.translationStorage.getName()
      }];
    }
    //Other items:
    var spId = spLang ? spLang.getId() : -1;
    App.languageCollection.getSpellingLanguages().each(function(l){
      if(l.getId() === spId) return;
      data.spList.options.push({
        link: 'data-href="'+App.router.linkConfig({SpLang: l})+'"'
      , name: l.getSpellingName()
      });
    }, this);
    //Filling phList:
    var phLang = App.pageState.getPhLang();
    if(phLang !== null){
      var phId = phLang.getId();
      //Initial data for phList
      data.phList.current = phLang.getShortName();
      data.phList.options = [];
      //Other phLangs:
      App.languageCollection.each(function(l){
        if(l.getId() === phId) return;
        data.phList.options.push({
          link: 'data-href="'+App.router.linkConfig({PhLang: l})+'"'
        , href: l.getShortName()
        });
      }, this);
    }
    //Use App.pageState.get{Sp,Ph}Lang
    this.setModel({searchFilter: data});
  }
  /***/
, updateWordList: function(){
    var data = {
      isLogical: App.pageState.wordOrderIsLogical()
    };
    if(data.isLogical){
      data.ahref = 'href="'+App.router.linkConfig({MeaningGroups: App.meaningGroupCollection})+'"';
      data.nhref = 'href="'+App.router.linkConfig({MeaningGroups: []})+'"';
      data.meaningGroups = [];
      var isMulti = App.pageState.isMultiView();
      App.meaningGroupCollection.each(function(m){
        var collapsed = !App.meaningGroupCollection.isSelected(m)
          , mg = {
              name: m.getName()
            , fold: collapsed ? 'mgFold' : 'mgUnfold'
            , triangle: collapsed ? 'icon-chevron-up rotate90' : 'icon-chevron-down'
            }
          , words = m.getWords();
        //Building the link to toggle the MeaningGroup:
        var toggleGroup = [], mgCol = App.meaningGroupCollection;
        if(collapsed){
          toggleGroup = mgCol.select(m).getSelected();
          mgCol.unselect(m);
        }else{
          toggleGroup = mgCol.unselect(m).getSelected();
          mgCol.select(m);
        }
        mg.link = 'href="'+App.router.linkConfig({MeaningGroups: toggleGroup})+'"';
        //Building the checkbox:
        if(isMulti){
          var box = {icon: 'icon-chkbox-custom'};
          switch(App.wordCollection.areSelected(words)){
            case 'all':
              var remaining = words.getDifference(App.wordCollection.getSelected(), words);
              box.icon = 'icon-check';
              box.link = 'data-href="'+App.router.linkCurrent({words: remaining})+'"';
              box.ttip = App.translationStorage.translateStatic('multimenu_tooltip_minus');
            break;
            case 'some':
              box.icon = 'icon-chkbox-half-custom';
            case 'none':
              var additional = words.getUnion(App.wordCollection.getSelected(), words);
              box.link = 'data-href="'+App.router.linkCurrent({words: additional})+'"';
              box.ttip = App.translationStorage.translateStatic('multimenu_tooltip_plus');
          }
          mg.checkbox = box;
        }
        //Finishing:
        mg.wordList = this.buildWordList(words);
        data.meaningGroups.push(mg);
      }, this);
    }else{
      data.wordList = this.buildWordList(App.wordCollection);
    }
    this.setModel(data);
  }
  /**
    This is a helper method for updateWordList.
    It creates the wordList for a given Collection of Words,
    so that they can be embedded in meaningGroups or in the WordMenu directly.
  */
, buildWordList: function(words){
    var ws = [], isMulti = App.pageState.isMultiView();
    words.each(function(word){
      var w = {
        cname:    word.getKey()
      , trans:    word.getModernName()
      , ttip:     word.getLongName()
      };
      //Deciding if a word is selected:
      if(isMulti){
        w.selected = App.wordCollection.isSelected(word);
      }else if(App.pageState.isPageView('w')){
        w.selected = App.wordCollection.isChoice(word);
      }else{
        w.selected = false;
      }
      //The checkbox/icon:
      if(isMulti){
        if(w.selected){
          var remaining = App.wordCollection.getDifference(App.wordCollection.getSelected(), [word]);
          w.icon = {
            ttip: App.translationStorage.translateStatic('multimenu_tooltip_del')
          , link: 'href="'+App.router.linkCurrent({words: remaining})+'"'
          , icon: 'icon-check'
          };
        }else{
          var additional = App.wordCollection.getUnion(App.wordCollection.getSelected(), [word]);
          w.icon = {
            ttip: App.translationStorage.translateStatic('multimenu_tooltip_add')
          , link: 'href="'+App.router.linkCurrent({words: additional})+'"'
          , icon: 'icon-chkbox-custom'
          };
        }
      }
      //Link for each word:
      w.link = App.pageState.isMapView()
             ? 'href="'+App.router.linkMapView({word: word})+'"'
             : 'href="'+App.router.linkWordView({word: word})+'"';
      //Phonetics:
      var phonetics = '*'+word.getProtoName();
      if(phLang = App.pageState.getPhLang()){
        var tr = word.getTranscription(phLang);
        phonetics = tr.getPhonetics();
      }
      //Finish it:
      _.each(phonetics, function(p){
        ws.push($.extend(w, {phonetic: p}))
      }, this);
    }, this);
    return {words: ws};
  }
  /***/
, render: function(){
    this.$el.html(App.templateStorage.render('WordMenu', {WordMenu: this.model}));
  }
  /**
    Basically the same as TopMenuView:setModel,
    this overwrites the current model with the given one performing a deep merge.
  */
, setModel: function(m){
    this.model = $.extend(true, this.model, m);
  }
});
