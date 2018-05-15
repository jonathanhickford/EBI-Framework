// Copyright (c) EMBL-EBI 2017
// Do not edit this file directly.
// It is made by concating .js files with by npm into script.js.
// Source files: js/ebi-css-build/script/*.js

/**
 * Utility function to get params from the URL.
 *
 * @param {string} name The string to look for
 * @param {string} [url=browserURL] Optionally pass a specific URL to parse
 *
 * @example
 * query string: ?foo=lorem&bar=&baz
 * var foo = getParameterByName('foo'); // "lorem"
 */
function ebiGetParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// utility function to see if element has a class
// hasClass(element, 'class-deska');
function ebiHasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

/**
 * Mark pdf/doc/txt links with link-pdf/link-doc/link-txt classes.
 */
function ebiFrameworkExternalLinks() {
  // exclude links with images
  // include only links to own domains
  function isOwnDomain(url) {
    return (url.indexOf('//') === -1 ||
      url.indexOf('//www.ebi.ac.uk') !== -1 ||
      url.indexOf('//wwwdev.ebi.ac.uk') !== -1 ||
      url.indexOf('//srs.ebi.ac.uk') !== -1 ||
      url.indexOf('//ftp.ebi.ac.uk') !== -1 ||
      url.indexOf('//intranet.ebi.ac.uk') !== -1 ||
      url.indexOf('//pdbe.org') !== -1 ||
      url.indexOf('//' + document.domain) !== -1);
  }
  function isFileType(url, type) {
    return url.indexOf(type, url.length-type.length)!==-1;
  }
  try {
    var alist = document.getElementsByTagName('a');
    var fileTypes = ['pdf', 'doc', 'txt'];
    var i, icon;
    for (i=0; i<alist.length; i++) {
      for (var type in fileTypes) {
        if (alist[i].innerHTML.indexOf('<span class="link-' + fileTypes[type] + '"></span>') === -1 && alist[i].innerHTML.indexOf('<img') === -1 && isFileType(alist[i].href, fileTypes[type]) && isOwnDomain(alist[i].href)) {
          icon = document.createElement('span');
          icon.className = 'link-' + fileTypes[type];
          alist[i].appendChild(icon);
        }
      }
    }
  }
  catch(err) {}
}

/**
 * Disable the global search if a page defines a local search.<br/>
 * Can also be disabled by adding class 'no-global-search' to the body element.
 */
function ebiFrameworkManageGlobalSearch() {
  try {
    var hasLocalSearch = document.getElementById('local-search') !== null;
    var hasLocalEBISearch = document.getElementById('ebi_search') !== null;
    if (hasLocalSearch || hasLocalEBISearch) {
      document.body.className += ' no-global-search';
    } else {
      try {
        // If the page gets a global search, we specify how the dropdown box should be. #RespectMyAuthoriti
        // remove any current dropdown
        if ((elem=document.getElementById('search-bar')) !== null) {
          document.getElementById('search-bar').remove();
        }

        var dropdownDiv = document.createElement("div");
        dropdownDiv.innerHTML = '<nav id="search-bar" class="search-bar global-masthead-interactive-banner">'+
          '<div class="row padding-bottom-medium">'+
            '<div class="columns padding-top-medium">'+
              '<button class="close-button" aria-label="Close alert" type="button"><span aria-hidden="true">×</span></button>'+
            '</div>'+
          '</div>'+
          '<div class="row">'+
          '<form id="global-search" name="global-search" action="/ebisearch/search.ebi" method="GET" class="">' +
              '<fieldset>' +
                '<div class="input-group">' +
                  '<input type="text" name="query" id="global-searchbox" class="input-group-field" placeholder="Search all of EMBL-EBI">' +
                  '<div class="input-group-button">' +
                    '<input type="submit" name="submit" value="Search" class="button">' +
                    '<input type="hidden" name="db" value="allebi" checked="checked">' +
                    '<input type="hidden" name="requestFrom" value="masthead-black-bar" checked="checked">' +
                  '</div>' +
                '</div>' +
              '</fieldset>' +
            '</form>'+
          '</div>'+
        '</nav>';
        document.getElementById("masthead-black-bar").insertBefore(dropdownDiv,document.getElementById("masthead-black-bar").firstChild);

        var searchBar = document.querySelectorAll(".search-bar")[0];
        var searchBarButton = document.querySelectorAll(".search-toggle")[0];
        var blackBar = document.querySelectorAll(".masthead-black-bar")[0];

        // add "peeking" animation for embl selector
        searchBarButton.addEventListener("mouseenter", function( event ) {
          if (ebiHasClass(document.querySelectorAll(".search-bar")[0], 'active') == false) {
            blackBar.className += ' peek';
          }
        }, false);
        searchBarButton.addEventListener("mouseleave", function( event ) {
          if (ebiHasClass(document.querySelectorAll(".search-bar")[0], 'active') == false) {
            blackBar.classList.remove("peek");
          }
        }, false);

        // toggle the .embl-bar
        var searchSelector = document.querySelectorAll(".search-toggle")[0].addEventListener("click", function( event ) {
          ebiToggleClass(searchBar,'active');
          ebiToggleClass(searchBarButton,'active');
          window.scrollTo(0, 0);
        }, false);

        var searchSelectorClose = document.querySelectorAll(".search-bar .close-button")[0].addEventListener("click", function( event ) {
          ebiToggleClass(searchBar,'active');
          ebiToggleClass(searchBarButton,'active');
          window.scrollTo(0, 0);
        }, false);

      } catch (err) {
        setTimeout(init, 500);
      }
    }
  }
  catch (err) {}
}

/**
 * Add error alerts for 'no input' on search boxes.<br/>
 * Todo: this, perhaps, shoule be moved to a value-add script file
 */
function ebiFrameworkSearchNullError() {
  try {
    var disabled = document.body.className.indexOf('no-search-error') !== -1;
    // Array of search box definition objects, specify inputNode, defaultText (optional, default ''), errorText (optional, default 'Please enter a search term')
    var searchBoxes = [
      { inputNode: document.getElementById('global-searchbox') }, // in global masthead
      { inputNode: document.getElementById('local-searchbox') }, // in local masthead
      { inputNode: document.body.className.indexOf('front') !== -1 ? document.getElementById('query') : null }, // on home page
      { inputNode: document.getElementById('people-groups') ? document.getElementById('people-groups').getElementsByTagName('input')[0] : null } // on people and group page
    ];

    if (!disabled) {
      for (searchBox in searchBoxes) {
        var searchInput = searchBoxes[searchBox].inputNode;
        var searchForm = (searchInput) ? searchInput.form : null;
        var searchInputDefault = searchBoxes[searchBox].defaultText || '';
        var searchError = searchBoxes[searchBox].errorText || 'Please enter a search term';
        var searchAction = (searchForm) ? searchForm.action : '';
        var isEbiSearch = searchAction.indexOf('/ebisearch/') !== -1;

        if (searchForm && searchInput && isEbiSearch) {
          // add reference to other items for onsubmit anonymous function
          searchForm.searchInput = searchInput;
          searchForm.searchInputDefault = searchInputDefault;
          searchForm.searchError = searchError;

          searchForm.onsubmit = function() {
            searchInput = this.searchInput;
            searchInputDefault = this.searchInputDefault;
            searchError = this.searchError;

            // Ensure input is trimmed
            searchInput.value = searchInput.value.trim();

            if (searchInput.value === searchInputDefault || searchInput.value === '') {
              alert(searchError);
              return false;
            }
          };
        }
      }
    }
  }
  catch (err) {}
}

/**
 * Utility method to get if it is IE, and what integer version.
 * via: https://stackoverflow.com/a/15983064
 * @returns {int} the IE version number
 * @example if (isIE () && isIE () < 9) { }
 */
function isIE () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

/**
 * Utility function to toggle classes. Chiefly to show the #embl-bar.
 */
function ebiToggleClass(element, toggleClass){
   var currentClass = element.className;
   var newClass;
   if(currentClass.split(" ").indexOf(toggleClass) > -1){ // has class
      newClass = currentClass.replace(new RegExp('\\b'+toggleClass+'\\b','g'),"")
   } else{
      newClass = currentClass + " " + toggleClass;
   }
   element.className = newClass.trim();
}

/**
 * Utility function to add classes (only once).
 */
function ebiActivateClass(element, cssClass){
  element.classList.remove(cssClass);
  element.classList.add(cssClass);
}

/**
 * Utility function to remove classes.
 */
function ebiRemoveClass(element, cssClass){
  element.classList.remove(cssClass);
}

/**
 * Remove global-nav/global-nav-expanded from header/footer if body.no-global-nav is set
 */
function ebiFrameworkHideGlobalNav() {
  try {
    var hasGlobalMasthead = document.getElementById('masthead-black-bar') !== null;
    var disabled = document.body.className.indexOf('no-global-nav') !== -1;
    var elem;

    if (hasGlobalMasthead && disabled) {
      if ((elem=document.getElementById('global-nav')) !== null) {
        elem.parentNode.removeChild(elem);
      }
      if ((elem=document.getElementById('global-nav-expanded')) !== null) {
        elem.parentNode.removeChild(elem);
      }
    }
  }
  catch (err) {}
}

/**
 * Assign global nav background images through meta tags
 */
function ebiFrameworkAssignImageByMetaTags() {
  var masthead = document.getElementById('masthead');
  // check for both ebi: and ebi- formatted meta tags
  var mastheadColor = document.querySelector("meta[name='ebi:masthead-color']") || document.querySelector("meta[name='ebi-masthead-color']");
  var mastheadImage = document.querySelector("meta[name='ebi:masthead-image']") || document.querySelector("meta[name='ebi-masthead-image']");

  if (mastheadColor != null) {
    masthead.style.backgroundColor = mastheadColor.getAttribute("content");
    masthead.className += ' meta-background-color';
  }
  if (mastheadImage != null) {
    masthead.style.backgroundImage = 'url(' + mastheadImage.getAttribute("content") + ')';
    masthead.className += ' meta-background-image';
  }
}

/**
 * Populate `#masthead-black-bar`
 */
function ebiFrameworkPopulateBlackBar() {
  try {
    // Clear any existing black bar contents
    if ((elem=document.getElementById('masthead-black-bar')) !== null) {
      document.getElementById('masthead-black-bar').innerHTML = "";
    }

    var barContents = document.createElement("div");
    barContents.innerHTML = '<nav class="row">'+
      '<ul id="global-nav" class="menu global-nav text-right">'+
        '<li class="home-mobile"><a href="https://www.ebi.ac.uk"></a></li>'+
        '<li class="where embl hide"><a href="http://www.embl.org">EMBL</a></li>'+
        '<li class="where barcelona hide"><a href="#">Barcelona</a></li>'+
        '<li class="where hamburg hide"><a href="#">Hamburg</a></li>'+
        '<li class="where grenoble hide"><a href="#">Heidelberg</a></li>'+
        '<li class="where grenoble hide"><a href="#">Grenoble</a></li>'+
        '<li class="where rome hide"><a href="#">Rome</a></li>'+
        '<li id="embl-selector" class="float-right show-for-medium embl-selector embl-ebi">'+
          '<button class="button float-right">&nbsp;</button>'+
        '</li>'+
        '<li class="float-right search">'+
          '<a href="#" class="inline-block collpased float-left search-toggle"><span class="show-for-small-only">Search</span></a>'+
          // '<div id="search-global-dropdown" class="dropdown-pane" data-dropdown data-options="closeOnClick:true;">'+
          // '</div>'+
        '</li>'+
        '<li class="what about"><a href="https://www.ebi.ac.uk/about">About us</a></li>'+
        '<li class="what training"><a href="https://www.ebi.ac.uk/training">Training</a></li>'+
        '<li class="what research"><a href="https://www.ebi.ac.uk/research">Research</a></li>'+
        '<li class="what services"><a href="https://www.ebi.ac.uk/services">Services</a></li>'+
        '<li class="where ebi"><a href="https://www.ebi.ac.uk">EMBL-EBI</a></li>'+
        // '<li class="float-right embl-selector">'+
        //   '<a class="button float-right">&nbsp;</a>'+
        // '</li>'+
        // '<li class="what mission hide"><a href="//www.embl.org">More mission areas:</a></li>'+
      '</ul>'+
    '</nav>';
    document.getElementById("masthead-black-bar").insertBefore(barContents,document.getElementById("masthead-black-bar").firstChild);
    document.body.className += ' ebi-black-bar-loaded';
  }
  catch(err) {};
}

/**
 * Reusable function to get part of the  black bar
 */
function ebiGetFacet(passedAttribute){
  var tag = "#masthead-black-bar ." + passedAttribute.toLowerCase();
  return document.querySelectorAll(tag)[0];
}

/**
 * Active tabs in `#masthead-black-bar` according to metadata
 */
function ebiFrameworkActivateBlackBar() {
  // Look at the embl:facet-* meta tags to set active states
  // <meta name="embl:rational" content="-3" />
  // <meta name="embl:external" content="8" />
  // <meta name="embl:active" content="what:*" />
  // <meta name="embl:parent-1" content="" />
  // <meta name="embl:parent-2" content="" />
  try {

    var metas = document.getElementsByTagName('meta');
    for (var i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute("name") == "embl:active") {
        var targetFacet = ebiGetFacet(metas[i].getAttribute("content").replace(':','.'));
        ebiRemoveClass(targetFacet,'hide');
        ebiActivateClass(targetFacet,'active');
      }
      if (metas[i].getAttribute("name") == "embl:parent-1") {
        var targetFacet = ebiGetFacet(metas[i].getAttribute("content").replace(':','.'));
        ebiRemoveClass(targetFacet,'hide');
        ebiActivateClass(targetFacet,'active');
      }
      if (metas[i].getAttribute("name") == "embl:parent-2") {
        var targetFacet = ebiGetFacet(metas[i].getAttribute("content").replace(':','.'));
        ebiRemoveClass(targetFacet,'hide');
        ebiActivateClass(targetFacet,'active');
      }
    }

    // add interactivity to facets, so that hovering on what:research shows what:*

    // we do this bit with jquery to prototype; need to rewire as vanilla JS.
    // ebiGetFacet('where.active').addEventListener("mouseenter", function( event ) {
    //   $('#masthead-black-bar .where.hide').addClass('hover float-left').removeClass('hide');
    //   // $('#masthead-black-bar .where.hide').removeClass('hide').addClass('hover');
    //   $('#masthead-black-bar .what').addClass('hide');
    // }, false);
    // ebiGetFacet('what.active').addEventListener("mouseenter", function( event ) {
    //   $('#masthead-black-bar .what').removeClass('hide float-left');
    //   $('#masthead-black-bar .what').addClass('hover float-left');
    //   $('#masthead-black-bar .where').addClass('hide');
    // }, false);

    // Only reset blackbar after XXXms outside the blackbar
    var mouseoutTimer;
    blackBar.addEventListener("mouseenter", function() {
      window.clearTimeout(mouseoutTimer);
    }, false);
    blackBar.addEventListener("mouseleave", function() {
      mouseoutTimer = window.setTimeout(function(){ resetBlackBar(); }, 500);
    });

    // reset black bar contexts when mousing out
    function resetBlackBar() {
      // console.log('purged');
      // $('#masthead-black-bar .hover').removeClass('hover float-left');
      // $('#masthead-black-bar .what').removeClass('hide');
      // $('#masthead-black-bar .where').addClass('hide');
      ebiFrameworkActivateBlackBar();
    }

  }
  catch(err) {};

}

/**
 * Insert EMBL dropdown menu into `#masthead-black-bar`
 */
function ebiFrameworkInsertEMBLdropdown() {
  try {
    // remove any current dropdown
    if ((elem=document.getElementById('embl-bar')) !== null) {
      document.getElementById('embl-bar').remove();
    }

    var dropdownDiv = document.createElement("div");
    dropdownDiv.innerHTML = '<nav id="embl-bar" class="embl-bar global-masthead-interactive-banner">'+
      '<div class="row padding-bottom-medium">'+
        '<div class="columns padding-top-medium">'+
          '<button class="close-button" aria-label="Close alert" type="button"><span aria-hidden="true">×</span></button>'+
        '</div>'+
        '<div class="columns medium-7">'+
          '<div class="large-10 medium-12">'+
            '<div class="margin-bottom-large padding-top-xsmall margin-top-large"><h3 class="no-underline inline" style="line-height: 1rem;"><a href="//embl.org">EMBL</a></h3> was set up in 1974 as Europe’s flagship laboratory for the life sciences – an intergovernmental organisation with more than 80 independent research groups covering the spectrum of molecular biology:</div>'+
          '</div>'+
          // From: https://www.embl.es/aboutus/general_information/index.html
          '<div class="row large-up-3 medium-up-3 small-up-2 no-underline medium-11">'+
            '<div class="column padding-bottom-medium"><a class="" href="https://www.embl.de/research/index.php"><h5 class="inline underline">Research:</h5> perform basic research in molecular biology</a></div>'+
            '<div class="column padding-bottom-medium"><a class="" href="https://www.embl.de/services/index.html"><h5 class="inline underline">Services:</h5> offer vital services to scientists in the member states</a></div>'+
            '<div class="column padding-bottom-medium"><a class="" href="https://www.embl.de/training/index.php"><h5 class="inline underline">Training</h5> scientists, students and visitors at all levels</a></div>'+
            '<div class="column padding-bottom-medium"><a class="" href="https://www.embl.de/research/tech_transfer/index.html"><h5 class="inline underline">Transfer</h5> and development of technology</a></div>'+
            '<div class="column padding-bottom-medium"><h5 class="inline underline">Develop</h5> new instruments and methods</div>'+
            '<div class="column padding-bottom-medium"><h5 class="inline underline">Integrating</h5> life science research in Europe</div>'+
          '</div>'+
          '<div class="margin-top-xlarge no-underline">'+
            '<h3><a href="//embl.org" class="readmore">More about EMBL</a></h3>'+
          '</div>'+
        '</div>'+
        '<div class="columns medium-5">'+
          '<div class="large-10 medium-12">'+
            '<h3 class="inline">Six sites</h3><p>represent EMBL in Europe.</p>'+
          '</div>'+
          '<div class="row medium-up-2 small-up-2">'+
            '<div class="column"><h5 class="inline"><a href="//www.embl-barcelona.es/">Barcelona</a></h5><p class="">Tissue biology and disease modelling</p></div>'+
            '<div class="column"><h5 class="inline"><a href="//www.embl.fr/">Grenoble</a></h5><p class="">Structural biology</p></div>'+
            '<div class="column"><h5 class="inline"><a href="//www.embl-hamburg.de/">Hamburg</a></h5><p class="">Structural biology</p></div>'+
            '<div class="column"><h5 class="inline"><a href="//www.embl.de/">Heidelberg</a></h5><p class="">Main laboratory</p></div>'+
            '<div class="column">'+
              '<h5 class="inline"><a href="https://www.ebi.ac.uk/">Hinxton</a></h5>'+
              // '<span class="tag "><i class="icon icon-generic" data-icon="["></i> you are here</span>'+
              '<p class="margin-bottom-none">EMBL-EBI: European Bioinformatics Institute</p>'+
            '</div>'+
            '<div class="column"><h5 class="inline"><a href="//www.embl.it/">Rome</a></h5><p class="">Epigenetics and neurobiology</p></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</nav>';
    document.getElementById("masthead-black-bar").insertBefore(dropdownDiv,document.getElementById("masthead-black-bar").firstChild);

    var emblBar = document.querySelectorAll(".embl-bar")[0];
    var emblBarButton = document.querySelectorAll(".embl-selector")[0];
    var blackBar = document.querySelectorAll(".masthead-black-bar")[0];

    // add "peeking" animation for embl selector
    emblBarButton.addEventListener("mouseenter", function( event ) {
      if (ebiHasClass(document.querySelectorAll(".embl-bar")[0], 'active') == false) {
        blackBar.className += ' peek';
      }
    }, false);
    emblBarButton.addEventListener("mouseleave", function( event ) {
      if (ebiHasClass(document.querySelectorAll(".embl-bar")[0], 'active') == false) {
        blackBar.classList.remove("peek");
      }
    }, false);

    // toggle the .embl-bar
    var emblSelector = document.querySelectorAll(".embl-selector")[0].addEventListener("click", function( event ) {
      ebiToggleClass(emblBar,'active');
      ebiToggleClass(emblBarButton,'active');
      window.scrollTo(0, 0);
    }, false);

    var emblSelectorClose = document.querySelectorAll(".embl-bar .close-button")[0].addEventListener("click", function( event ) {
      ebiToggleClass(emblBar,'active');
      ebiToggleClass(emblBarButton,'active');
      window.scrollTo(0, 0);
    }, false);


  }
  catch(err) {};
}

/**
 * Insert EBI Footer into `#global-nav-expanded`
 */
function ebiFrameworkUpdateFoot() {
  var html = '<div class="columns small-12">' +
    '<h4 class="inline-block"><a href="https://www.ebi.ac.uk" class="no-underline" title="EMBL-EBI">EMBL-EBI</a></h4>' +
    '<span class="small inline-block padding-left-large"><a class="readmore" href="http://intranet.ebi.ac.uk"><span class="icon icon-functional" data-icon="L"></span> Intranet for staff</a></span>' +
  '</div>' +
  '<div class="medium-up-5 small-up-2">' +
    '<div class="column">' +
      '<h5 class="services"><a class="services-color" href="https://www.ebi.ac.uk/services">Services</a></h5><ul>' + ' <li class="first"><a href="https://www.ebi.ac.uk/services">By topic</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/services/all">By name (A-Z)</a></li> ' + ' <li class="last"><a href="https://www.ebi.ac.uk/support">Help &amp; Support</a></li> ' + '</ul></div>' +
    '<div class="column">' +
      '<h5 class="research"><a class="research-color" href="https://www.ebi.ac.uk/research">Research</a></h5><ul>' + ' <li><a href="https://www.ebi.ac.uk/research/publications">Publications</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/research/groups">Research groups</a></li> ' + ' <li class="last"><a href="https://www.ebi.ac.uk/research/postdocs">Postdocs</a> &amp; <a href="https://www.ebi.ac.uk/research/eipp">PhDs</a></li> ' +
    '</ul></div>' +
    '<div class="column"> ' +
      '<h5 class="training"><a class="training-color" href="https://www.ebi.ac.uk/training">Training</a></h5><ul>' + ' <li><a href="https://www.ebi.ac.uk/training/handson">Train at EBI</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/training/roadshow">Train outside EBI</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/training/online">Train online</a></li> ' + ' <li class="last"><a href="https://www.ebi.ac.uk/training/contact-us">Contact organisers</a></li> ' +
    '</ul></div> ' +
    '<div class="column"> ' +
      '<h5 class="industry"><a class="industry-color" href="https://www.ebi.ac.uk/industry">Industry</a></h5><ul>' + ' <li><a href="https://www.ebi.ac.uk/industry/private">Members Area</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/industry/workshops">Workshops</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/industry/sme-forum"><abbr title="Small Medium Enterprise">SME</abbr> Forum</a></li> ' + ' <li class="last"><a href="https://www.ebi.ac.uk/industry/contact">Contact Industry programme</a></li> ' + '</ul></div> ' +
    '<div class="column"> ' +
      '<h5 class="about"><a class="ebi-color" href="https://www.ebi.ac.uk/about">About</a></h5><ul> ' + ' <li><a href="https://www.ebi.ac.uk/about/contact">Contact us</a>' + '<li><a href="https://www.ebi.ac.uk/about/events">Events</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/about/jobs" title="Jobs, postdocs, PhDs...">Jobs</a></li> ' + ' <li class="first"><a href="https://www.ebi.ac.uk/about/news">News</a></li> ' + ' <li><a href="https://www.ebi.ac.uk/about/people">People &amp; groups</a></li> ' +
    '</ul></div>' +
    '</div>';

  function init() {
    try {
      var foot = document.getElementById('global-nav-expanded');
      foot.innerHTML = html;
    } catch (err) {
      setTimeout(init, 500);
    }
  }
  init();
}

/**
 * Insert footer meta info into `#ebi-footer-meta`
 */
function ebiFrameworkUpdateFooterMeta() {
  var d = new Date();
  var html = '<div class="columns">' +
                '<p class="address">EMBL-EBI, Wellcome Genome Campus, Hinxton, Cambridgeshire, CB10 1SD, UK. +44 (0)1223 49 44 44</p> <p class="legal">Copyright &copy; EMBL-EBI ' + d.getFullYear() + ' | EMBL-EBI is <a href="http://www.embl.org/">part of the European Molecular Biology Laboratory</a> | <a href="https://www.ebi.ac.uk/about/terms-of-use">Terms of use</a>' +
                // '<a class="readmore float-right" href="http://intranet.ebi.ac.uk">Intranet</a>' +
              '</p></div>';

  function init() {
    try {
      var foot = document.getElementById('ebi-footer-meta');
      foot.innerHTML = html;
    } catch (err) { setTimeout(init, 500); }
  }
  init();
}

/**
 * Once an announcement has been matched to the current page, show it (if there is one).
 * @param {Object} message - The message you wish to show on the page.
 * @param {string} message.headline - The headline to show (text)
 * @param {string} message.message - The contents of the message (HTML)
 * @param {string} [message.priority = 'callout'] - Optional class to add to message box. 'alert', 'warning', 'industry-background white-color'
 * @example
 *   ebiInjectAnnouncements({ headline: 'Your headline here', message: 'this', priority: 'alert' });
 */
function ebiInjectAnnouncements(message) {
  if (typeof(message) == 'undefined') {
    return false;
  };

  if (typeof(message.processed) != 'undefined') {
    // don't show a message more than once
    return true;
  } else {
    // mark message as shown
    message.processed=true;
  }

  var container = (document.getElementById('main-content-area') || document.getElementById('main-content') || document.getElementById('main') || document.getElementById('content') || document.getElementById('contentsarea'));
  if (container == null) {
    // if no suitable container, warn
    console.warn('A message needs to be shown on this site, but an appropriate container could not be found. \n Message follows:','\n' + message.headline,'\n' + message.message,'\n' + 'Priority:',message.priority)
    return false;
  }
  var banner = document.createElement('div');
  var wrapper = document.createElement('div');
  // var inner = document.createElement('div');

  // banner.id = "";
  banner.className = "notifications-js row margin-top-medium";
  wrapper.className = "callout " + (message.priority || "");
  wrapper.innerHTML = "<h3>" + message.headline + "</h3>" +
  message.message +
  // "<div id='cookie-dismiss'><button class='close-button' style='top: 0.3rem; color:#fff;' aria-label='Close alert' type='button'><span aria-hidden='true'>&times;</span></button></div>" +
  "";

  container.insertBefore(banner, container.firstChild);

  banner.appendChild(wrapper);
}

/**
 * Load the downtime/announcement messages, if any.
 * For more info, see: https://gitlab.ebi.ac.uk/ebiwd/ebi.emblstatic.net-root-assets/tree/master/src
 */
function ebiFrameworkIncludeAnnouncements() {
  // var downtimeScript =  'https://dev.ebi.emblstatic.net/announcements.js?' + Math.round(new Date().getTime() / 3600000);

  // are there matching announcements for the current URL
  function detectAnnouncements(messages) {

    var currentHost = window.location.hostname,
        currentPath = window.location.pathname;

    // don't treat wwwdev as distinct from www
    currentHost = currentHost.replace(/wwwdev/g , "www");

    // try to show any possible variations of the url
    // Note: this is pretty simple stupid, but maybe it's more effective than a sophisticated solution?
    ebiInjectAnnouncements(messages[currentHost]);
    ebiInjectAnnouncements(messages[currentHost+'/']);
    ebiInjectAnnouncements(messages[currentHost+'/*']);
    if (currentPath.length > 1) {
      // don't try to much no path or '/'
      var currentPathArray = currentPath.split('/');

      // construct a list of possible paths to match
      // /style-lab/frag1/frag2 =
      // - /style-lab/frag1/frag2
      // - /style-lab/frag1
      // - /style-lab
      var pathsToMatch = [currentHost+currentPathArray[0]];
      for (var i = 1; i < currentPathArray.length; i++) {
        var tempPath = pathsToMatch[i-1];
        pathsToMatch.push(tempPath+'/'+currentPathArray[i])
      }

      for (var i = 0; i < pathsToMatch.length; i++) {
        // console.log('matching:',pathsToMatch[i]);
        ebiInjectAnnouncements(messages[pathsToMatch[i]]);
        ebiInjectAnnouncements(messages[pathsToMatch[i]+'*']);
        ebiInjectAnnouncements(messages[pathsToMatch[i]+'/*']);
      }
    }
  }

  function loadRemoteAnnouncements(file) {
    if (window.XMLHttpRequest) {
      xmlhttp=new XMLHttpRequest();
    }
    xmlhttp.open("GET", file, true);
    xmlhttp.onload = function (e) {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          eval(xmlhttp.responseText);
          detectAnnouncements(m);
        } else {
          console.error(xmlhttp.statusText);
        }
      }
    };
    xmlhttp.onerror = function (e) {
      console.error(xmlhttp.statusText);
    };
    xmlhttp.send(null);
  }

  if (window.location.hostname.indexOf('wwwdev.') === 0) {
    // Load test message on wwwdev
    loadRemoteAnnouncements('https://dev.ebi.emblstatic.net/announcements.js');
  } else {
    loadRemoteAnnouncements('https://ebi.emblstatic.net/announcements.js');
  }

}

// Injects the Data Protection notice onto sites
// For guidance on using: https://www.ebi.ac.uk/style-lab/websites/patterns/banner-data-protection.html
function ebiFrameworkCreateDataProtectionBanner() {
  var banner = document.createElement('div');
  var wrapper = document.createElement('div');
  var inner = document.createElement('div');

  // don't accidently create two banners
  if (document.getElementById("data-protection-banner") != null) {
    document.getElementById("data-protection-banner").remove();
  }

  banner.id = "data-protection-banner";
  banner.className = "data-protection-banner";
  banner.style = "position: fixed; background-color: #111; width: 100%; padding: .75rem; left: 0; bottom: 0; color: #eee;"
  wrapper.className = "row";
  wrapper.innerHTML = "" +
    "<div class='columns medium-8 large-9'>" +
    dataProtectionSettings.message +
    " To find out more, see our <a target='_blank' href='" + dataProtectionSettings.link + "' class='white-color'>privacy policy</a>.</div>" +
    "<div class='columns medium-4 large-3 text-right white-color'><a id='data-protection-agree' class=''>I agree, dismiss this banner</a></div>" +
    "";

  document.body.appendChild(banner);
  banner.appendChild(wrapper);

  openDataProtectionBanner();
}

function openDataProtectionBanner() {
  var height = document.getElementById('data-protection-banner').offsetHeight || 0;
  document.getElementById('data-protection-banner').style.display = 'block';
  document.body.style.paddingBottom = height+'px';

  document.getElementById('data-protection-agree').onclick = function() {
    closeDataProtectionBanner();
    return false;
  };
}

function closeDataProtectionBanner() {
  var height = document.getElementById('data-protection-banner').offsetHeight;
  document.getElementById('data-protection-banner').style.display = 'none';
  document.body.style.paddingBottom = '0';
  ebiFrameworkSetCookie(dataProtectionSettings.cookieName, 'true', 90);
}

function ebiFrameworkSetCookie(c_name, value, exdays) {
  var exdate = new Date();
  var c_value;
  exdate.setDate(exdate.getDate() + exdays);
  // c_value = escape(value) + ((exdays===null) ? "" : ";expires=" + exdate.toUTCString()) + ";domain=.ebi.ac.uk;path=/";
  // document.cookie = c_name + "=" + c_value;
  c_value = escape(value) + ((exdays===null) ? "" : ";expires=" + exdate.toUTCString()) + ";domain=" + document.domain + ";path=/";
  document.cookie = c_name + "=" + c_value;
}

function ebiFrameworkGetCookie(c_name) {
  var i, x, y, ARRcookies=document.cookie.split(";");
  for (i=0; i<ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x = x.replace(/^\s+|\s+$/g,"");
    if (x===c_name) {
      return unescape(y);
    }
  }
}

var dataProtectionSettings =  new Object();

function ebiFrameworkRunDataProtectionBanner() {
  try {
    dataProtectionSettings.message = 'This website uses cookies. By continuing to browse this site, you are agreeing to the use of our site cookies. We also collect some information [text goes here, please review and agree]. ';
    dataProtectionSettings.link = 'https://www.ebi.ac.uk/about/link-needed-to-data-protection';
    dataProtectionSettings.serviceId = 'ebi';
    dataProtectionSettings.dataProtectionVersion = '1.0';

    // If there's a div#data-protection-message-configuration, override defaults
    var divDataProtectionBanner = document.getElementById('data-protection-message-configuration');
    if (divDataProtectionBanner !== null) {
      if (typeof divDataProtectionBanner.dataset.message !== "undefined") {
        dataProtectionSettings.message = divDataProtectionBanner.dataset.message;
      }
      if (typeof divDataProtectionBanner.dataset.link !== "undefined") {
        dataProtectionSettings.link = divDataProtectionBanner.dataset.link;
      }
      if (typeof divDataProtectionBanner.dataset.serviceId !== "undefined") {
        dataProtectionSettings.serviceId = divDataProtectionBanner.dataset.serviceId;
      }
      if (typeof divDataProtectionBanner.dataset.dataProtectionVersion !== "undefined") {
        dataProtectionSettings.dataProtectionVersion = divDataProtectionBanner.dataset.dataProtectionVersion;
      }
    }

    dataProtectionSettings.cookieName = dataProtectionSettings.serviceId + "-v" + dataProtectionSettings.dataProtectionVersion + "-data-protection-accepted";

    // If this version of banner not accpeted, show it:
    if (ebiFrameworkGetCookie(dataProtectionSettings.cookieName) != "true") {
      ebiFrameworkCreateDataProtectionBanner();
    }

  } catch(err) { setTimeout(ebiFrameworkRunDataProtectionBanner, 100); }
}

function resetDataProtectionBanner() {
  document.cookie = dataProtectionSettings.cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=" + document.domain + ";path=/";
  ebiFrameworkRunDataProtectionBanner();
}

// execute
ebiFrameworkRunDataProtectionBanner();

/**
 * All scripts are automatically loaded, unless the page asked us not to.
 * @example
 * Configurable with a data attribute:
 * <body data-ebiFrameworkInvokeScripts="false">
 */
function ebiFrameworkInvokeScripts() {
  ebiFrameworkPopulateBlackBar();
  ebiFrameworkActivateBlackBar();
  ebiFrameworkExternalLinks();
  ebiFrameworkManageGlobalSearch();
  ebiFrameworkSearchNullError();
  ebiFrameworkHideGlobalNav();
  ebiFrameworkAssignImageByMetaTags();
  ebiFrameworkInsertEMBLdropdown();
  ebiFrameworkUpdateFoot();
  ebiFrameworkUpdateFooterMeta();
  ebiFrameworkIncludeAnnouncements();
  ebiFrameworkRunDataProtectionBanner();
}

document.addEventListener("DOMContentLoaded", function(event) {
  var bodyData = document.body.dataset;
  // document.body.dataset not supported in < ie10
  if (isIE () && isIE () <= 10) { bodyData = []; }
  if (bodyData["ebiframeworkinvokescripts"] != "false") {
    ebiFrameworkInvokeScripts();
  }
});
