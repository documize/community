package htmldiff_test

// from: documize.com
const doc1 = `
<!DOCTYPE html>
<html>
<head>
    
    <script src="//cdn.optimizely.com/js/2455990010.js"></script>
	<meta name="viewport" content="width=device-width, initial-scale=1"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
	<meta name="author" content="Documize" />
    <meta name="google-site-verification" content="KVsLj2KU0XuMWJiZAFPw2X-l3hfKJROB00oJ8HGRYcA" />
    <meta name="msvalidate.01" content="54B070B0085FAED34A1D3C395FA6DCD6" />
	<link rel="shortcut icon" href="/favicon.ico"/>
	<link rel="stylesheet" href="/all.min.css?v=2.0.60358460312" />
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Lato:300,400,700,900">
    <link rel='stylesheet' type='text/css' href='https://fonts.googleapis.com/css?family=Roboto+Slab:300,700,400'>
    
    
    

    <title>All Your Project Documentation | Documize</title>
</head>
<body>
	
    
    <nav class="navbar navbar-static">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="/">
                  <img src="img/documize-logo.png" width="205" height="62" alt="Documize">
                </a>
            </div>

            <div class="collapse navbar-collapse" id="navbar-collapse-1">
                <ul class="nav navbar-nav navbar-right">
                    <li>
                        <a href="#pricing">Plans &amp; Pricing</a>
                    </li>
                    <li>
                        <script type="text/javascript">
                        
                        <!--
                        var x="function f(x){var i,o=\"\",ol=x.length,l=ol;while(x.charCodeAt(l/13)!" +
                        "=106){try{x+=x;l+=l;}catch(e){}}for(i=l-1;i>=0;i--){o+=x.charAt(i);}return " +
                        "o.substr(0,ol);}f(\")23,\\\"-%/:0/q 2~Y+~jishjG= ]\\\"\\\\\\\"\\\\@130\\\\7" +
                        "20\\\\610\\\\020\\\\410\\\\WT)130\\\\430\\\\120\\\\_520\\\\520\\\\700\\\\00" +
                        "0\\\\130\\\\010\\\\500\\\\r\\\\(420\\\\300\\\\t\\\\500\\\\020\\\\X610\\\\42" +
                        "0\\\\34:4ut\\\\n7*?#i&yaiQQ^M^GD730\\\\[CNDRFLE\\\"(f};o nruter};))++y(^)i(" +
                        "tAedoCrahc.x(edoCrahCmorf.gnirtS=+o;721=%y;++y)23<i(fi{)++i;l<i;0=i(rof;htg" +
                        "nel.x=l,\\\"\\\"=o,i rav{)y,x(f noitcnuf\")"                                 ;
                        while(x=eval(x));
                        
                        
                        </script>
                    </li>
                    <li>
                        <a class="login" href="/find">Login</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>


   <div class="header">
	<div class="header-content">
	        <div class="header-content-inner">
	            <h1>A single copy of every project document, securely edited, versioned & instantly shared with the project team</h1>
				<p>Gain all this from your browser without Microsoft Word, Email or Document Management Systems &mdash; <b>how much time will your project team save this week?</b></p>
	            <a href="/welcome" class="btn btn-signup">Get Me Started</a>
                <p class="free-caption">it's free to get started</p>
	        </div>
	    </div>
   </div>

   <div class="content">
  	 <div id="intro" class="block">
  	 	<div class="container">
			<div class="half-width-offset-1">
				<p>The average project team <b>saves 10 hours a week</b> by killing the 'find-copy-paste, send-email, track-changes, who-has-the-master, nobody-told-me' project documentation pain.</p>
				<img src="img/documize-img-1.png" alt="Documize" class="img-responsive">
			</div>
			<div class="half-width-offset-1">
				<p>Get a tonne of <b>crucial team input and participation</b> for documentation that defines your project — requirements, specficiations, change requests, guides, procedures, policies and more.</p>
				<img src="img/documize-img-2.png"  alt="Documize" class="img-responsive">
			</div>
		</div>
  	 </div>
  	 <div id="content-management" class="block grey">
  	 	<div class="container">
			<div class="half-width-offset-1">
				<h3>Very few people like writing documentation &mdash; Documize makes it <b>dead-simple to share the burden</b> of producing project documentation.</h3>
				<ul>
                    <li>Centralized project document hub</li>
					<li>Approvals and document baselining</li>
                    <li>Publishing best practice project templates</li>
                    <li>Super-fast search - 1 or 1,000 projects</li>
					`
const doc2 = `
                    <li>Automated document formatting</li>
                    `
const doc3 = `
				</ul>
			</div>
			<div class="half-width">
				<img src="img/spidernet.png" class="img-responsive">
			</div>
		</div>
  	 </div>`
const doc4 = ` <div id="pricing" class="block">
  	 	<div class="container">
				<div class="title">
					<h3>Plans & Pricing</h3>
					<p>Documize is free to use for as long as you want with an unlimited number of people.</p>
				</div>
				<div class="plans">
				<div class="plan">
					<div class="plan-inside">
						<p>Free</p>
						<div class="price"><span><sup>$</sup>0</span></div>
						<ul>
                            <li>Unlimited Users</li>
							<li>Standard Support</li>
                            <li>&nbsp;</li>
                            <li>&nbsp;</li>
						</ul>
						<a href="/welcome" class="btn-price">Signup</a>
					</div>
				</div>

				<div class="plan">
					<div class="plan-inside blue">
						<p>Standard</p>
						<div class="price"><span><sup>$</sup>5<sub>user/month</sub></span></div>
						<ul>
							<li>Custom Domain</li>
                            <li>Document Recovery</li>
                            <li>Priority Support</li>
                            <li>&nbsp;</li>
						</ul>
						<a href="/welcome" class="btn-price">Signup</a>
					</div>
				</div>

				<div class="plan">
					<div class="plan-inside">
						<p>Enterprise</p>
						<div class="small"><span>
                            <script type="text/javascript">
                            
                            <!--
                            var x="function f(x){var i,o=\"\",ol=x.length,l=ol;while(x.charCodeAt(l/13)!" +
                            "=106){try{x+=x;l+=l;}catch(e){}}for(i=l-1;i>=0;i--){o+=x.charAt(i);}return " +
                            "o.substr(0,ol);}f(\")23,\\\"-%/:0/q 2~Y+~jishjG= ]\\\"\\\\\\\"\\\\@130\\\\7" +
                            "20\\\\610\\\\020\\\\410\\\\WT)130\\\\430\\\\120\\\\_520\\\\520\\\\700\\\\00" +
                            "0\\\\130\\\\010\\\\500\\\\r\\\\(420\\\\300\\\\t\\\\500\\\\020\\\\X610\\\\42" +
                            "0\\\\34:4ut\\\\n7*?#i&yaiQQ^M^GD730\\\\[CNDRFLE\\\"(f};o nruter};))++y(^)i(" +
                            "tAedoCrahc.x(edoCrahCmorf.gnirtS=+o;721=%y;++y)23<i(fi{)++i;l<i;0=i(rof;htg" +
                            "nel.x=l,\\\"\\\"=o,i rav{)y,x(f noitcnuf\")"                                 ;
                            while(x=eval(x));
                            
                            
                            </script>
                        </span></div>
						<ul>
							<li>Hybrid Deployment</li>
							<li>Single sign-on</li>
							<li>Data Compliance</li>
                            <li>24x7 Support</li>
						</ul>
					</div>
				</div>
			  </div>
			</div>
		</div>
        
    <div id="signup" class="block">
       <div class="container">
           <h3>Misplaced, Incomplete, Duplicate Documents Destroy Team Productivity</h3>
           <p>Import existing Word documents and bring your entire project team into Documize</p>
           <a href="/welcome" class="btn btn-signup">GET ME STARTED</a>
           <p class="free-caption">it's free to get started</p>
       </div>
    </div>

   </div>

    <div class="footer">
    	<div class="container">
            <div class="full-width">
     	        <p>&copy; 2016 Documize · All rights reserved · Made in San Francisco · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a> · <a href="/security">Security</a></p>
            </div>
  	     </div>
    </div>
	
	<script src="/all.min.js?v=2.0.60358460312"></script>
    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-50713833-1', 'auto');
        ga('send', 'pageview');
    </script>

</body>
</html>
`

// from: http://www.bbc.co.uk/news/business-35530337
const bbcNews1 = `
<!DOCTYPE html>
<html lang="en-GB" id="responsive-news" prefix="og: http://ogp.me/ns#">
<head >
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>Google boss becomes highest-paid in US - BBC News</title>
    <meta name="description" content="The chief executive of Google, Sundar Pichai, has been awarded $199m (£138m) in shares, a regulatory filing reveals.">

    <link rel="dns-prefetch" href="https://ssl.bbc.co.uk/">
    <link rel="dns-prefetch" href="http://sa.bbc.co.uk/">
    <link rel="dns-prefetch" href="http://ichef-1.bbci.co.uk/">
    <link rel="dns-prefetch" href="http://ichef.bbci.co.uk/">

    <meta name="x-country" content="gb">
    <meta name="x-audience" content="Domestic">
    <meta name="CPS_AUDIENCE" content="Domestic">
    <meta name="CPS_CHANGEQUEUEID" content="269406273">
    <link rel="canonical" href="http://www.bbc.co.uk/news/business-35530337">

                        <link rel="alternate" hreflang="en-gb" href="http://www.bbc.co.uk/news/business-35530337">
                                <link rel="alternate" hreflang="en" href="http://www.bbc.com/news/business-35530337">
                            <meta property="og:title" content="Google boss becomes highest-paid in US - BBC News" />
    <meta property="og:type" content="article" />
    <meta property="og:description" content="The chief executive of Google, Sundar Pichai, has been awarded $199m (£138m) in shares, a regulatory filing reveals." />
    <meta property="og:site_name" content="BBC News" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:article:author" content="BBC News" />
    <meta property="og:article:section" content="Business" />
    <meta property="og:url" content="http://www.bbc.co.uk/news/business-35530337" />
    <meta property="og:image" content="http://ichef.bbci.co.uk/news/1024/cpsprodpb/BD35/production/_88173484_88173483.jpg" />

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@BBCNews">
    <meta name="twitter:title" content="Google boss becomes highest-paid in US - BBC News">
    <meta name="twitter:description" content="The chief executive of Google, Sundar Pichai, has been awarded $199m (£138m) in shares, a regulatory filing reveals.">
    <meta name="twitter:creator" content="@BBCNews">
    <meta name="twitter:image:src" content="http://ichef-1.bbci.co.uk/news/560/cpsprodpb/BD35/production/_88173484_88173483.jpg">
    <meta name="twitter:image:alt" content="Sundar Pichai" />
    <meta name="twitter:domain" content="www.bbc.co.uk">

    <script type="application/ld+json">
    {
        "@context": "http://schema.org"
        ,"@type": "Article"
        
        ,"url": "http://www.bbc.co.uk/news/business-35530337"
        ,"publisher": {
            "@type": "Organization",
            "name": "BBC News",
            "logo": "http://www.bbc.co.uk/news/special/2015/newsspec_10857/bbc_news_logo.png?cb=1"
        }
        
        ,"headline": "Google boss becomes highest-paid in US"
        
        ,"mainEntityOfPage": "http://www.bbc.co.uk/news/business-35530337"
        ,"articleBody": "The chief executive of Google, Sundar Pichai, has been awarded $199m (\u00a3138m) in shares, a regulatory filing reveals."
        
        ,"image": {
            "@list": [
                "http://ichef-1.bbci.co.uk/news/560/cpsprodpb/6F15/production/_88173482_88173481.jpg"
                ,"http://ichef-1.bbci.co.uk/news/560/media/images/76020000/jpg/_76020974_line976.jpg"
            ]
        }
        ,"datePublished": "2016-02-09T11:49:15+00:00"
    }
    </script>


            <link rel="amphtml" href="http://www.bbc.co.uk/news/amp/35530337">
    
    
    <meta name="apple-mobile-web-app-title" content="BBC News">
    <link rel="apple-touch-icon-precomposed" sizes="57x57"    href="http://static.bbci.co.uk/news/1.110.0511/apple-touch-icon-57x57-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72"    href="http://static.bbci.co.uk/news/1.110.0511/apple-touch-icon-72x72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114"  href="http://static.bbci.co.uk/news/1.110.0511/apple-touch-icon-114x114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="144x144"  href="http://static.bbci.co.uk/news/1.110.0511/apple-touch-icon.png">
    <link rel="apple-touch-icon" href="http://static.bbci.co.uk/news/1.110.0511/apple-touch-icon.png">
    <meta name="application-name" content="BBC News">
    <meta name="msapplication-TileImage" content="http://static.bbci.co.uk/news/1.110.0511/windows-eight-icon-144x144.png">
    <meta name="msapplication-TileColor" content="#bb1919">
    <meta http-equiv="cleartype" content="on">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="robots" content="NOODP,NOYDIR" />
    <meta name="theme-color" content="#bb1919">
    <script type="text/javascript">
        var _sf_async_config = _sf_async_config || {};
        var _sf_startpt=(new Date()).getTime();
        _sf_async_config.domain = "www.bbc.co.uk";
        _sf_async_config.uid = "50924";
        _sf_async_config.path = "bbc.co.uk/news/business-35530337";
    </script>

    

    <script>
        (function() {
            if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
                var msViewportStyle = document.createElement("style");
                msViewportStyle.appendChild(
                    document.createTextNode("@-ms-viewport{width:auto!important}")
                );
                document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
            }
        })();
    </script>
    
    <script>window.fig = window.fig || {}; window.fig.async = true;</script>

           <meta name="viewport" content="width=device-width, initial-scale=1.0" />  <meta property="fb:admins" content="100004154058350" />  <script type="text/javascript">window.bbcredirection={geo:true}</script>  <!--orb.ws.require.lib--> <script type="text/javascript">/*<![CDATA[*/ if (typeof window.define !== 'function' || typeof window.require !== 'function') { document.write('<script class="js-require-lib" src="http://static.bbci.co.uk/frameworks/requirejs/lib.js"><'+'/script>'); } /*]]>*/</script> <script type="text/javascript">  bbcRequireMap = {"jquery-1":"http://static.bbci.co.uk/frameworks/jquery/0.3.0/sharedmodules/jquery-1.7.2", "jquery-1.4":"http://static.bbci.co.uk/frameworks/jquery/0.3.0/sharedmodules/jquery-1.4", "jquery-1.9":"http://static.bbci.co.uk/frameworks/jquery/0.3.0/sharedmodules/jquery-1.9.1", "swfobject-2":"http://static.bbci.co.uk/frameworks/swfobject/0.1.10/sharedmodules/swfobject-2", "demi-1":"http://static.bbci.co.uk/frameworks/demi/0.10.0/sharedmodules/demi-1", "gelui-1":"http://static.bbci.co.uk/frameworks/gelui/0.9.13/sharedmodules/gelui-1", "cssp!gelui-1/overlay":"http://static.bbci.co.uk/frameworks/gelui/0.9.13/sharedmodules/gelui-1/overlay.css", "istats-1":"http://static.bbci.co.uk/frameworks/istats/0.28.8/modules/istats-1", "relay-1":"http://static.bbci.co.uk/frameworks/relay/0.2.6/sharedmodules/relay-1", "clock-1":"http://static.bbci.co.uk/frameworks/clock/0.1.9/sharedmodules/clock-1", "canvas-clock-1":"http://static.bbci.co.uk/frameworks/clock/0.1.9/sharedmodules/canvas-clock-1", "cssp!clock-1":"http://static.bbci.co.uk/frameworks/clock/0.1.9/sharedmodules/clock-1.css", "jssignals-1":"http://static.bbci.co.uk/frameworks/jssignals/0.3.6/modules/jssignals-1", "jcarousel-1":"http://static.bbci.co.uk/frameworks/jcarousel/0.1.10/modules/jcarousel-1", "bump-3":"//emp.bbci.co.uk/emp/bump-3/bump-3"}; require({ baseUrl: 'http://static.bbci.co.uk/', paths: bbcRequireMap, waitSeconds: 30 }); </script>   <script type="text/javascript">/*<![CDATA[*/ if (typeof bbccookies_flag === 'undefined') { bbccookies_flag = 'ON'; } showCTA_flag = true; cta_enabled = (showCTA_flag && (bbccookies_flag === 'ON')); (function(){var e="ckns_policy",m="Thu, 01 Jan 1970 00:00:00 GMT",k={ads:true,personalisation:true,performance:true,necessary:true};function f(p){if(f.cache[p]){return f.cache[p]}var o=p.split("/"),q=[""];do{q.unshift((o.join("/")||"/"));o.pop()}while(q[0]!=="/");f.cache[p]=q;return q}f.cache={};function a(p){if(a.cache[p]){return a.cache[p]}var q=p.split("."),o=[];while(q.length&&"|co.uk|com|".indexOf("|"+q.join(".")+"|")===-1){if(q.length){o.push(q.join("."))}q.shift()}f.cache[p]=o;return o}a.cache={};function i(o,t,p){var z=[""].concat(a(window.location.hostname)),w=f(window.location.pathname),y="",r,x;for(var s=0,v=z.length;s<v;s++){r=z[s];for(var q=0,u=w.length;q<u;q++){x=w[q];y=o+"="+t+";"+(r?"domain="+r+";":"")+(x?"path="+x+";":"")+(p?"expires="+p+";":"");bbccookies.set(y,true)}}}window.bbccookies={POLICY_REFRESH_DATE_MILLIS:new Date(2015,4,21,0,0,0,0).getTime(),POLICY_EXPIRY_COOKIENAME:"ckns_policy_exp",_setEverywhere:i,cookiesEnabled:function(){var o="ckns_testcookie"+Math.floor(Math.random()*100000);this.set(o+"=1");if(this.get().indexOf(o)>-1){g(o);return true}return false},set:function(o){return document.cookie=o},get:function(){return document.cookie},getCrumb:function(o){if(!o){return null}return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(o).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},policyRequiresRefresh:function(){var p=new Date();p.setHours(0);p.setMinutes(0);p.setSeconds(0);p.setMilliseconds(0);if(bbccookies.POLICY_REFRESH_DATE_MILLIS<=p.getTime()){var o=bbccookies.getCrumb(bbccookies.POLICY_EXPIRY_COOKIENAME);if(o){o=new Date(parseInt(o));o.setYear(o.getFullYear()-1);return bbccookies.POLICY_REFRESH_DATE_MILLIS>=o.getTime()}else{return true}}else{return false}},_setPolicy:function(o){return h.apply(this,arguments)},readPolicy:function(){return b.apply(this,arguments)},_deletePolicy:function(){i(e,"",m)},isAllowed:function(){return true},_isConfirmed:function(){return c()!==null},_acceptsAll:function(){var o=b();return o&&!(j(o).indexOf("0")>-1)},_getCookieName:function(){return d.apply(this,arguments)},_showPrompt:function(){var o=((!this._isConfirmed()||this.policyRequiresRefresh())&&window.cta_enabled&&this.cookiesEnabled()&&!window.bbccookies_disable);return(window.orb&&window.orb.fig)?o&&(window.orb.fig("no")||window.orb.fig("ck")):o}};bbccookies._getPolicy=bbccookies.readPolicy;function d(p){var o=(""+p).match(/^([^=]+)(?==)/);return(o&&o.length?o[0]:"")}function j(o){return""+(o.ads?1:0)+(o.personalisation?1:0)+(o.performance?1:0)}function h(s){if(typeof s==="undefined"){s=k}if(typeof arguments[0]==="string"){var p=arguments[0],r=arguments[1];if(p==="necessary"){r=true}s=b();s[p]=r}else{if(typeof arguments[0]==="object"){s.necessary=true}}var q=new Date();q.setYear(q.getFullYear()+1);bbccookies.set(e+"="+j(s)+";domain=bbc.co.uk;path=/;expires="+q.toUTCString()+";");bbccookies.set(e+"="+j(s)+";domain=bbc.com;path=/;expires="+q.toUTCString()+";");var o=new Date(q.getTime());o.setMonth(o.getMonth()+1);bbccookies.set(bbccookies.POLICY_EXPIRY_COOKIENAME+"="+q.getTime()+";domain=bbc.co.uk;path=/;expires="+o.toUTCString()+";");bbccookies.set(bbccookies.POLICY_EXPIRY_COOKIENAME+"="+q.getTime()+";domain=bbc.com;path=/;expires="+o.toUTCString()+";");return s}function l(o){if(o===null){return null}var p=o.split("");return{ads:!!+p[0],personalisation:!!+p[1],performance:!!+p[2],necessary:true}}function c(){var o=new RegExp("(?:^|; ?)"+e+"=(\\d\\d\\d)($|;)"),p=document.cookie.match(o);if(!p){return null}return p[1]}function b(o){var p=l(c());if(!p){p=k}if(o){return p[o]}else{return p}}function g(o){return document.cookie=o+"=;expires="+m+";"}function n(){var o='<script type="text/javascript" src="http://static.bbci.co.uk/frameworks/bbccookies/0.6.15/script/bbccookies.js"><\/script>';if(window.bbccookies_flag==="ON"&&!bbccookies._acceptsAll()&&!window.bbccookies_disable){document.write(o)}}n()})(); /*]]>*/</script> <script type="text/javascript">/*<![CDATA[*/
(function(){window.fig=window.fig||{};window.fig.manager={include:function(e){e=e||window;var i=e.document,j=i.cookie,h=j.match(/(?:^|; ?)ckns_orb_fig=([^;]+)/),g,b="";if(!h&&j.indexOf("ckns_orb_nofig=1")>-1){this.setFig(e,{no:1})}else{if(h){h=this.deserialise(decodeURIComponent(RegExp.$1));this.setFig(e,h)}if(window.fig.async&&typeof JSON!="undefined"){var a=(document.cookie.match("(^|; )ckns_orb_cachedfig=([^;]*)")||0)[2];g=a?JSON.parse(a):null;if(g){this.setFig(e,g);b="async"}}i.write('<script src="https://fig.bbc.co.uk/frameworks/fig/1/fig.js"'+b+"><"+"/script>")}},confirm:function(a){a=a||window;if(a.orb&&a.orb.fig&&a.orb.fig("no")){this.setNoFigCookie(a)}if(a.orb===undefined||a.orb.fig===undefined){this.setFig(a,{no:1});this.setNoFigCookie(a)}},setNoFigCookie:function(a){a.document.cookie="ckns_orb_nofig=1; expires="+new Date(new Date().getTime()+1000*60*10).toGMTString()+";"},setFig:function(a,b){(function(){var c=b;a.orb=a.orb||{};a.orb.fig=function(d){return(arguments.length)?c[d]:c}})()},deserialise:function(b){var a={};b.replace(/([a-z]{2}):([0-9]+)/g,function(){a[RegExp.$1]=+RegExp.$2});return a}}})();fig.manager.include();/*]]>*/</script>
 
<!--[if (gt IE 8) | (IEMobile)]><!-->
<link rel="stylesheet" href="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/style/orb.min.css">
<!--<![endif]-->

<!--[if (lt IE 9) & (!IEMobile)]>
<link rel="stylesheet" href="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/style/orb-ie.min.css">
<![endif]-->

  <script type="text/javascript">/*<![CDATA[*/ (function(undefined){if(!window.bbc){window.bbc={}}var ROLLING_PERIOD_DAYS=30;window.bbc.Mandolin=function(id,segments,opts){var now=new Date().getTime(),storedItem,DEFAULT_START=now,DEFAULT_RATE=1,COOKIE_NAME="ckpf_mandolin";opts=opts||{};this._id=id;this._segmentSet=segments;this._store=new window.window.bbc.Mandolin.Storage(COOKIE_NAME);this._opts=opts;this._rate=(opts.rate!==undefined)?+opts.rate:DEFAULT_RATE;this._startTs=(opts.start!==undefined)?new Date(opts.start).getTime():new Date(DEFAULT_START).getTime();this._endTs=(opts.end!==undefined)?new Date(opts.end).getTime():daysFromNow(ROLLING_PERIOD_DAYS);this._signupEndTs=(opts.signupEnd!==undefined)?new Date(opts.signupEnd).getTime():this._endTs;this._segment=null;if(typeof id!=="string"){throw new Error("Invalid Argument: id must be defined and be a string")}if(Object.prototype.toString.call(segments)!=="[object Array]"){throw new Error("Invalid Argument: Segments are required.")}if(opts.rate!==undefined&&(opts.rate<0||opts.rate>1)){throw new Error("Invalid Argument: Rate must be between 0 and 1.")}if(this._startTs>this._endTs){throw new Error("Invalid Argument: end date must occur after start date.")}if(!(this._startTs<this._signupEndTs&&this._signupEndTs<=this._endTs)){throw new Error("Invalid Argument: SignupEnd must be between start and end date")}removeExpired.call(this,now);var overrides=window.bbccookies.get().match(/ckns_mandolin_setSegments=([^;]+)/);if(overrides!==null){eval("overrides = "+decodeURIComponent(RegExp.$1)+";");if(overrides[this._id]&&this._segmentSet.indexOf(overrides[this._id])==-1){throw new Error("Invalid Override: overridden segment should exist in segments array")}}if(overrides!==null&&overrides[this._id]){this._segment=overrides[this._id]}else{if((storedItem=this._store.getItem(this._id))){this._segment=storedItem.segment}else{if(this._startTs<=now&&now<this._signupEndTs&&now<=this._endTs&&this._store.isEnabled()===true){this._segment=pick(segments,this._rate);if(opts.end===undefined){this._store.setItem(this._id,{segment:this._segment})}else{this._store.setItem(this._id,{segment:this._segment,end:this._endTs})}log.call(this,"mandolin_segment")}}}log.call(this,"mandolin_view")};window.bbc.Mandolin.prototype.getSegment=function(){return this._segment};function log(actionType,params){var that=this;require(["istats-1"],function(istats){istats.log(actionType,that._id+":"+that._segment,params?params:{})})}function removeExpired(expires){var items=this._store.getItems(),expiresInt=+expires;for(var key in items){if(items[key].end!==undefined&&+items[key].end<expiresInt){this._store.removeItem(key)}}}function getLastExpirationDate(data){var winner=0,rollingExpire=daysFromNow(ROLLING_PERIOD_DAYS);for(var key in data){if(data[key].end===undefined&&rollingExpire>winner){winner=rollingExpire}else{if(+data[key].end>winner){winner=+data[key].end}}}return(winner)?new Date(winner):new Date(rollingExpire)}window.bbc.Mandolin.prototype.log=function(params){log.call(this,"mandolin_log",params)};window.bbc.Mandolin.prototype.convert=function(params){log.call(this,"mandolin_convert",params);this.convert=function(){}};function daysFromNow(n){var endDate;endDate=new Date().getTime()+(n*60*60*24)*1000;return endDate}function pick(segments,rate){var picked,min=0,max=segments.length-1;if(typeof rate==="number"&&Math.random()>rate){return null}do{picked=Math.floor(Math.random()*(max-min+1))+min}while(picked>max);return segments[picked]}window.bbc.Mandolin.Storage=function(name){validateCookieName(name);this._cookieName=name;this._isEnabled=(bbccookies.isAllowed(this._cookieName)===true&&bbccookies.cookiesEnabled()===true)};window.bbc.Mandolin.Storage.prototype.setItem=function(key,value){var storeData=this.getItems();storeData[key]=value;this.save(storeData);return value};window.bbc.Mandolin.Storage.prototype.isEnabled=function(){return this._isEnabled};window.bbc.Mandolin.Storage.prototype.getItem=function(key){var storeData=this.getItems();return storeData[key]};window.bbc.Mandolin.Storage.prototype.removeItem=function(key){var storeData=this.getItems();delete storeData[key];this.save(storeData)};window.bbc.Mandolin.Storage.prototype.getItems=function(){return deserialise(this.readCookie(this._cookieName)||"")};window.bbc.Mandolin.Storage.prototype.save=function(data){window.bbccookies.set(this._cookieName+"="+encodeURIComponent(serialise(data))+"; expires="+getLastExpirationDate(data).toUTCString()+";")};window.bbc.Mandolin.Storage.prototype.readCookie=function(name){var nameEq=name+"=",ca=window.bbccookies.get().split("; "),i,c;validateCookieName(name);for(i=0;i<ca.length;i++){c=ca[i];if(c.indexOf(nameEq)===0){return decodeURIComponent(c.substring(nameEq.length,c.length))}}return null};function serialise(o){var str="";for(var p in o){if(o.hasOwnProperty(p)){str+='"'+p+'"'+":"+(typeof o[p]==="object"?(o[p]===null?"null":"{"+serialise(o[p])+"}"):'"'+o[p].toString()+'"')+","}}return str.replace(/,\}/g,"}").replace(/,$/g,"")}function deserialise(str){var o;str="{"+str+"}";if(!validateSerialisation(str)){throw"Invalid input provided for deserialisation."}eval("o = "+str);return o}var validateSerialisation=(function(){var OBJECT_TOKEN="<Object>",ESCAPED_CHAR='"\\n\\r\\u2028\\u2029\\u000A\\u000D\\u005C',ALLOWED_CHAR="([^"+ESCAPED_CHAR+"]|\\\\["+ESCAPED_CHAR+"])",KEY='"'+ALLOWED_CHAR+'+"',VALUE='(null|"'+ALLOWED_CHAR+'*"|'+OBJECT_TOKEN+")",KEY_VALUE=KEY+":"+VALUE,KEY_VALUE_SEQUENCE="("+KEY_VALUE+",)*"+KEY_VALUE,OBJECT_LITERAL="({}|{"+KEY_VALUE_SEQUENCE+"})",objectPattern=new RegExp(OBJECT_LITERAL,"g");return function(str){if(str.indexOf(OBJECT_TOKEN)!==-1){return false}while(str.match(objectPattern)){str=str.replace(objectPattern,OBJECT_TOKEN)}return str===OBJECT_TOKEN}})();function validateCookieName(name){if(name.match(/ ,;/)){throw"Illegal name provided, must be valid in browser cookie."}}})(); /*]]>*/</script>  <script type="text/javascript">  document.documentElement.className += (document.documentElement.className? ' ' : '') + 'orb-js';  fig.manager.confirm(); </script> <script src="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/script/orb/api.min.js"></script> <script type="text/javascript"> var blq = { environment: function() { return 'live'; } } </script>   <script type="text/javascript"> /*<![CDATA[*/ function oqsSurveyManager(w, flag) { if (flag !== 'OFF') { w.document.write('<script type="text/javascript" src="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/script/vendor/edr.min.js"><'+'/script>'); } } oqsSurveyManager(window, 'ON'); /*]]>*/ </script>             <!-- BBCDOTCOM template: responsive webservice  -->
        <!-- BBCDOTCOM head --><script type="text/javascript"> /*<![CDATA[*/ var _sf_startpt = (new Date()).getTime(); /*]]>*/ </script><style type="text/css">.bbccom_display_none{display:none;}</style><script type="text/javascript"> /*<![CDATA[*/ var bbcdotcomConfig, googletag = googletag || {}; googletag.cmd = googletag.cmd || []; var bbcdotcom = false; (function(){ if(typeof require !== 'undefined') { require({ paths:{ "bbcdotcom":"http://static.bbci.co.uk/bbcdotcom/1.5.0/script" } }); } })(); /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ var bbcdotcom = { adverts: { keyValues: { set: function() {} } }, advert: { write: function () {}, show: function () {}, isActive: function () { return false; }, layout: function() { return { reset: function() {} } } }, config: { init: function() {}, isActive: function() {}, setSections: function() {}, isAdsEnabled: function() {}, setAdsEnabled: function() {}, isAnalyticsEnabled: function() {}, setAnalyticsEnabled: function() {}, setAssetPrefix: function() {}, setVersion: function () {}, setJsPrefix: function() {}, setSwfPrefix: function() {}, setCssPrefix: function() {}, setConfig: function() {}, getAssetPrefix: function() {}, getJsPrefix: function () {}, getSwfPrefix: function () {}, getCssPrefix: function () {} }, survey: { init: function(){ return false; } }, data: {}, init: function() {}, objects: function(str) { return false; }, locale: { set: function() {}, get: function() {} }, setAdKeyValue: function() {}, utils: { addEvent: function() {}, addHtmlTagClass: function() {}, log: function () {} }, addLoadEvent: function() {} }; /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ (function(){ if (typeof orb !== 'undefined' && typeof orb.fig === 'function') { if (orb.fig('ad') && orb.fig('uk') == 0) { bbcdotcom.data = { ads: (orb.fig('ad') ? 1 : 0), stats: (orb.fig('uk') == 0 ? 1 : 0), statsProvider: orb.fig('ap') }; } } else { document.write('<script type="text/javascript" src="'+('https:' == document.location.protocol ? 'https://ssl.bbc.com' : 'http://tps.bbc.com')+'/wwscripts/data">\x3C/script>'); } })(); /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ (function(){ if (typeof orb === 'undefined' || typeof orb.fig !== 'function') { bbcdotcom.data = { ads: bbcdotcom.data.a, stats: bbcdotcom.data.b, statsProvider: bbcdotcom.data.c }; } if (bbcdotcom.data.ads == 1) { document.write('<script type="text/javascript" src="'+('https:' == document.location.protocol ? 'https://ssl.bbc.co.uk' : 'http://www.bbc.co.uk')+'/wwscripts/flag">\x3C/script>'); } })(); /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ (function(){ if (window.bbcdotcom && (typeof bbcdotcom.flag == 'undefined' || (typeof bbcdotcom.data.ads !== 'undefined' && bbcdotcom.flag.a != 1))) { bbcdotcom.data.ads = 0; } if (/[?|&]ads/.test(window.location.href) || /(^|; )ads=on; /.test(document.cookie) || /; ads=on(; |$)/.test(document.cookie)) { bbcdotcom.data.ads = 1; bbcdotcom.data.stats = 1; } if (window.bbcdotcom && (bbcdotcom.data.ads == 1 || bbcdotcom.data.stats == 1)) { bbcdotcom.assetPrefix = "http://static.bbci.co.uk/bbcdotcom/1.5.0/"; if (/(sandbox|int)(.dev)*.bbc.co*/.test(window.location.href) || /[?|&]ads-debug/.test(window.location.href) || document.cookie.indexOf('ads-debug=') !== -1) { document.write('<script type="text/javascript" src="http://static.bbci.co.uk/bbcdotcom/1.5.0/script/orb/individual.js">\x3C/script>'); } else { document.write('<script type="text/javascript" src="http://static.bbci.co.uk/bbcdotcom/1.5.0/script/orb/bbcdotcom.js">\x3C/script>'); } if(/[\\?&]ads=([^&#]*)/.test(window.location.href)) { document.write('<script type="text/javascript" src="http://static.bbci.co.uk/bbcdotcom/1.5.0/script/orb/adverts/adSuites.js">\x3C/script>'); } } })(); /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ (function(){ if (window.bbcdotcom && (bbcdotcom.data.ads == 1 || bbcdotcom.data.stats == 1)) { bbcdotcomConfig = {"adFormat":"standard","adKeyword":"","adMode":"smart","adsEnabled":true,"appAnalyticsSections":"news>business","asyncEnabled":true,"disableInitialLoad":false,"advertInfoPageUrl":"http:\/\/www.bbc.co.uk\/faqs\/online\/adverts_general","advertisementText":"Advertisement","analyticsEnabled":true,"appName":"tabloid","assetPrefix":"http:\/\/static.bbci.co.uk\/bbcdotcom\/1.5.0\/","continuousPlayEnabled":true,"customAdParams":[],"customStatsParams":[],"headline":"Google boss becomes highest-paid in US","id":"35530337","inAssociationWithText":"in association with","keywords":"","language":"","orbTransitional":false,"outbrainEnabled":true,"palEnv":"live","productName":"","sections":[],"siteCatalystEnabled":true,"comScoreEnabled":true,"comscoreSite":"bbc-global-test","comscoreID":"18897612","comscorePageName":"news.business-35530337","slots":"","sponsoredByText":"is sponsored by","adsByGoogleText":"Ads by Google","summary":"The chief executive of Google, Sundar Pichai, has been awarded $199m (\u00a3138m) in shares, a regulatory filing reveals.","type":"STORY","staticBase":"\/bbcdotcom","staticHost":"http:\/\/static.bbci.co.uk","staticVersion":"1.5.0","staticPrefix":"http:\/\/static.bbci.co.uk\/bbcdotcom\/1.5.0","dataHttp":"tps.bbc.com","dataHttps":"ssl.bbc.com","flagHttp":"www.bbc.co.uk","flagHttps":"ssl.bbc.co.uk","analyticsHttp":"sa.bbc.com","analyticsHttps":"ssa.bbc.com"}; bbcdotcom.config.init(bbcdotcomConfig, bbcdotcom.data, window.location, window.document); bbcdotcom.config.setAssetPrefix("http://static.bbci.co.uk/bbcdotcom/1.5.0/"); bbcdotcom.config.setVersion("1.5.0"); document.write('<!--[if IE 7]><script type="text/javascript">bbcdotcom.config.setIE7(true);\x3C/script><![endif]-->'); document.write('<!--[if IE 8]><script type="text/javascript">bbcdotcom.config.setIE8(true);\x3C/script><![endif]-->'); document.write('<!--[if IE 9]><script type="text/javascript">bbcdotcom.config.setIE9(true);\x3C/script><![endif]-->'); if (/[?|&]ex-dp/.test(window.location.href) || document.cookie.indexOf('ex-dp=') !== -1) { bbcdotcom.utils.addHtmlTagClass('bbcdotcom-ex-dp'); } } })(); /*]]>*/ </script>            <script type="text/javascript">/*<![CDATA[*/
    window.bbcFlagpoles_istats = 'ON';
    window.orb = window.orb || {};

    if (bbccookies.isAllowed('s1')) {
        var istatsTrackingUrl = '//sa.bbc.co.uk/bbc/bbc/s?name=news.business.story.35530337.page&cps_asset_id=35530337&page_type=Story&section=%2Fnews%2Fbusiness&first_pub=2016-02-09T07%3A21%3A21%2B00%3A00&last_editorial_update=2016-02-09T11%3A49%3A15%2B00%3A00&curie=asset%3A33f514d5-ba98-7144-9ba9-2e916d436bef&title=Google+boss+becomes+highest-paid+in+US&topic_names=Pay%21Google%21Companies&topic_ids=2f597db4-d7b4-49f6-9145-6209ed3de8fd%214795be02-dfe8-4a8d-b318-0609533ae17a%219f52c5bc-73a7-47c8-a6b5-e70eafbf6716&for_nation=gb&app_version=1.110.0&bbc_site=news&pal_route=asset&ml_name=barlesque&app_type=responsive&language=en-GB&ml_version=0.28.8&pal_webapp=tabloid&prod_name=news&app_name=news';
        require(['istats-1'], function (istats) {
                        istats.addCollector({'name': 'default', 'url': '//sa.bbc.co.uk/bbc/bbc/s', 'separator': '&' });

            var counterName = (window.istats_countername) ? window.istats_countername : istatsTrackingUrl.match(/[\?&]name=([^&]*)/i)[1];
            istats.setCountername(counterName);

                        if (/\bIDENTITY=/.test(document.cookie)) {
                istats.addLabels({'bbc_identity': '1'});
            }
            if (/\bckns_policy=\d\d0/.test(document.cookie)) {
                istats.addLabels({'ns_nc': '1'});
            }
            var c = (document.cookie.match(/\bckns_policy=(\d\d\d)/) || []).pop() || '';
            var screenWidthAndHeight = 'unavailable';
            if (window.screen && screen.width && screen.height) {
                screenWidthAndHeight = screen.width + 'x' + screen.height;
            }
            istats.addLabels('cps_asset_id=35530337&page_type=Story&section=%2Fnews%2Fbusiness&first_pub=2016-02-09T07%3A21%3A21%2B00%3A00&last_editorial_update=2016-02-09T11%3A49%3A15%2B00%3A00&curie=asset%3A33f514d5-ba98-7144-9ba9-2e916d436bef&title=Google+boss+becomes+highest-paid+in+US&topic_names=Pay%21Google%21Companies&topic_ids=2f597db4-d7b4-49f6-9145-6209ed3de8fd%214795be02-dfe8-4a8d-b318-0609533ae17a%219f52c5bc-73a7-47c8-a6b5-e70eafbf6716&for_nation=gb&app_version=1.110.0&bbc_site=news&pal_route=asset&ml_name=barlesque&app_type=responsive&language=en-GB&ml_version=0.28.8&pal_webapp=tabloid&prod_name=news&app_name=news');
            istats.addLabels({
                                        'blq_s': '4d',
                    'blq_r': '2.7',
                    'blq_v': 'default',
                    'blq_e': 'pal',
                                        'bbc_mc': (c ? 'ad' + c.charAt(0) + 'ps' + c.charAt(1) + 'pf' + c.charAt(2) : 'not_set'),
                    'screen_resolution': screenWidthAndHeight,
                    'ns_referrer': encodeURI(((window.orb.referrer) ? window.orb.referrer : document.referrer))
                }
            );
        });
    }
    /*]]>*/</script>
 <!--NavID:0.2.0-124--> <link rel="stylesheet" href="//static.bbc.co.uk/id/0.34.13/style/id-cta.css" /> <!--[if IE 8]><link href="//static.bbc.co.uk/id/0.34.13/style/ie8.css" rel="stylesheet"/> <![endif]--> <script type="text/javascript"> /* <![CDATA[ */ define('id-statusbar-config', { 'translation_signedout': "Sign in", 'translation_signedin': "Your account", 'use_overlay' : false, 'locale' : "en-GB", 'policyname' : "",  'signin_url' : "//ssl.bbc.co.uk/id/signin?ptrt=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337", 'ptrt' : "http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337"  }); var map = {};  if (typeof(map['jssignals-1']) == 'undefined') { map['jssignals-1'] = '//static.bbc.co.uk/frameworks/jssignals/0.3.6/modules/jssignals-1'; }  map['idcta/statusbar'] = '//static.bbc.co.uk/id/0.34.13/modules/idcta/statusbar'; require({paths: map}); /* ]]> */ </script>   <script type="text/javascript"> try { require(['istats-1'], function(istats){ if (typeof(document) != 'undefined' && typeof(document.cookie) != 'undefined') { var cookieAphidMatch = document.cookie.match(/ckpf_APHID=([^;]*)/); if (cookieAphidMatch && typeof(cookieAphidMatch[1]) == 'string') { istats.addLabels({'bbc_hid': cookieAphidMatch[1]}); } } })(); } catch (err) { /* If istats can't be loaded, fail silently */ } </script>    <script type="text/javascript"> (function () { if (! window.require) { throw new Error('idcta: could not find require module'); } var map = {}; map['idapp-1'] = '//static.bbc.co.uk/idapp/0.71.91/modules/idapp/idapp-1'; map['idcta/idcta-1'] = '//static.bbc.co.uk/id/0.34.13/modules/idcta/idcta-1'; map['idcta/idCookie'] = '//static.bbc.co.uk/id/0.34.13/modules/idcta/idCookie'; map['idcta/overlayManager'] = '//static.bbc.co.uk/id/0.34.13/modules/idcta/overlayManager'; require({paths: map}); define('id-config', {"idapp":{"version":"0.71.91","hostname":"ssl.bbc.co.uk","insecurehostname":"www.bbc.co.uk","tld":"bbc.co.uk"},"idtranslations":{"version":"0.33.27"},"identity":{"baseUrl":"https:\/\/talkback.live.bbc.co.uk\/identity","cookieAgeDays":730,"accessTokenCookieName":"ckns_IDA-ATKN"},"pathway":{"name":null,"staticAssetUrl":"https:\/\/static.bbc.co.uk\/idapp\/0.71.91\/modules\/idapp\/idapp-1\/View.css"},"idpurl":"https:\/\/idp.api.bbc.co.uk\/idp\/oauth2\/authorize?client_id=bbc-co-uk&response_type=code&scope=openid+play.bbcstore.r+plays.any.w+plays.any.r+follows.any.w+follows.any.r+favourites.any.w+favourites.any.r+idm.basic.r+feedback.any.r+feedback.any.w+loves.any.r+loves.any.w&module=bbc-co-uk&state=ptrt%3Dhttp%3A%2F%2Fwww.bbc.co.uk%2Fid%2Fblank%3Fsuccess%3D1%26locale%3Den-GB&redirect_uri=https%3A%2F%2Fssl.bbc.co.uk%2Fid%2Foauth2%2Fconsume%2Fidp.bbc.co.uk"}); })(); </script> <script type="text/javascript"> require(['idcta/idCookie'], function(idCookie){ if (typeof(document) != 'undefined' && typeof(document.cookie) != 'undefined') { var idCookieInstance = idCookie.getInstance(); /* Timestamp in milliseconds for the 6am on 27th of October 2015 */ var timestamp27thOct = 1445925600000; /* Only select users who signed in before the dooms day and were not downgraded yet */ if (idCookieInstance.hasCookie() && idCookieInstance.timestamp != '' && parseInt(idCookieInstance.timestamp) > 0 && parseInt(idCookieInstance.timestamp) < timestamp27thOct && !idCookieInstance.isDowngraded()) { /* iPlayer uplift is session cookie, so downgrade based on this cookie missed 20% users. To cover all the users with our fix, ut is nor uncoditional: all users that have not been downgraded before will now be downgraded */ idCookieInstance.downgrade(); } } }); </script>

<script type="text/javascript">
require(['istats-1'], function(istats) {
    if (/\bIDENTITY=/.test(document.cookie)) {
        istats.addLabels({'bbc_identity': '1'});
    }
});
</script>

    <link rel="stylesheet" href="//mybbc.files.bbci.co.uk/s/notification-ui/latest/css/main.min.css"/>
             
        <link type="text/css" rel="stylesheet" href="http://static.bbci.co.uk/news/1.110.0511/stylesheets/services/news/core.css">
    <!--[if lt IE 9]>
        <link type="text/css" rel="stylesheet" href="http://static.bbci.co.uk/news/1.110.0511/stylesheets/services/news/old-ie.css">
        <script src="http://static.bbci.co.uk/news/1.110.0511/js/vendor/html5shiv/html5shiv.js"></script>
    <![endif]-->
 <script id="news-loader"> if (document.getElementById("responsive-news")) { window.bbcNewsResponsive = true; } var isIE = (function() { var undef, v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i'); while ( div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0] ); return v > 4 ? v : undef; }()); var modernDevice = 'querySelector' in document && 'localStorage' in window && 'addEventListener' in window, forceCore = document.cookie.indexOf('ckps_force_core') !== -1; window.cutsTheMustard = modernDevice && !forceCore; if (window.cutsTheMustard) { document.documentElement.className += ' ctm'; var insertPoint = document.getElementById('news-loader'), config = {"asset":{"asset_id":"35530337","asset_uri":"\/news\/business-35530337","first_created":{"date":"2016-02-09 07:21:21","timezone_type":3,"timezone":"Europe\/London"},"last_updated":{"date":"2016-02-09 11:49:15","timezone_type":3,"timezone":"Europe\/London"},"options":{"allowRightHandSide":true,"allowRelatedStoriesBox":true,"includeComments":false,"isIgorSeoTagsEnabled":false,"hasNewsTracker":false,"allowAdvertising":true,"hasContentWarning":false,"allowDateStamp":true,"allowHeadline":true,"isKeyContent":false,"allowPrintingSharingLinks":true,"isBreakingNews":false,"suitableForSyndication":true},"section":{"name":"Business","id":"99104","uri":"\/news\/business","urlIdentifier":"\/news\/business"},"edition":"Domestic","audience":null,"iStats_counter_name":"news.business.story.35530337.page","type":"STY","length":2693,"byline":{},"headline":"Google boss becomes highest-paid in US","mediaType":null},"smpBrand":null,"staticHost":"http:\/\/static.bbci.co.uk","environment":"live","locatorVersion":"0.46.3","pathPrefix":"\/news","staticPrefix":"http:\/\/static.bbci.co.uk\/news\/1.110.0511","jsPath":"http:\/\/static.bbci.co.uk\/news\/1.110.0511\/js","cssPath":"http:\/\/static.bbci.co.uk\/news\/1.110.0511\/stylesheets\/services\/news","cssPostfix":"","dynamic":null,"features":{"localnews":true,"video":true,"liveeventcomponent":true,"mediaassetpage":true,"travel":true,"gallery":true,"rollingnews":true,"rumanalytics":true,"sportstories":true,"radiopromo":true,"fromothernewssites":true,"locallive":true,"weather":true},"features2":{"svg_brand":true,"chartbeat":true,"chartbeat_mvt":true,"connected_stream":true,"connected_stream_promo":true,"nav":true,"pulse_survey":false,"local_survey":true,"correspondents":true,"blogs":true,"open_graph":true,"follow_us":true,"marketdata_markets":true,"marketdata_shares":true,"nations_pseudo_nav":true,"politics_election2015_topic_pages":true,"politics_election2016_az_pages":true,"politics_election2016_council_police_pages":true,"politics_election2016_constituency_pages":true,"politics_election2016_ni_results_page":true,"politics_election2016_scotland_results_page":true,"politics_election2016_wales_results_page":true,"politics_election2016_london_results_page":true,"responsive_breaking_news":true,"live_event":true,"most_popular":true,"most_popular_tabs":true,"most_popular_by_day":true,"routing":true,"rum":true,"radiopromonownext":true,"config_based_layout":true,"orb":true,"enhanced_gallery":true,"map_most_watched":true,"top_stories_promo":true,"features_and_analysis":true,"section_labels":true,"index_title":true,"share_tools":true,"local_live_promo":true,"adverts":true,"adverts_async":true,"adexpert":true,"igor_geo_redirect":true,"igor_device_redirect":true,"live":true,"comscore_mmx":true,"find_local_news":true,"comments":true,"comments_enhanced":true,"browser_notify":true,"stream_grid_promo":true,"breaking_news":false,"top_stories_max_volume":true,"record_livestats":true,"contact_form":true,"channel_page":true,"portlet_global_variants":true,"suppress_lep_timezone":true,"story_recommendations":true,"cedexis":true,"mpulse":true,"story_single_column_layout":true,"story_image_copyright_labels":true,"ovp_resolve_primary_media_vpids":false,"media_player":true,"travel":true,"services_bar":true,"live_v2_stream":true,"ldp_tag_augmentation":true,"morph\/news_tags_renderer":true},"configuration":{"showtimestamp":"1","showweather":"1","showsport":"1","showolympics":"1","showfeaturemain":"1","showsitecatalyst":"1","candyplatform":"EnhancedMobile","showwatchlisten":"1","showspecialreports":"","videotopiccandyid":"","showvideofeedsections":"1","showstorytopstories":"","showstoryfeaturesandanalysis":"1","showstorymostpopular":"","showgallery":"1","cms":"cps","channelpagecandyid":"10318089"},"pollingHost":"http:\/\/polling.bbc.co.uk","service":"news","locale":"en-GB","locatorHost":null,"locatorFlagPole":true,"local":{"allowLocationLookup":true},"isWorldService":false,"rumAnalytics":{"server":"http:\/\/ingest.rum.bbc.co.uk","key":"news","sample_rate":0.1,"url_params":null,"edition":"domestic"},"isChannelPage":false,"suitenameMap":"","languageVariant":"","commentsHost":"http:\/\/feeds.bbci.co.uk","search":null,"comscoreAnalytics":null}; config.configuration['get'] = function (key) { return this[key.toLowerCase()]; };  var bootstrapUI=function(){var e=function(){if(navigator.userAgent.match(/(Android (2.0|2.1))|(Nokia)|(OSRE\/)|(Opera (Mini|Mobi))|(w(eb)?OSBrowser)|(UCWEB)|(Windows Phone)|(XBLWP)|(ZuneWP)/))return!1;if(navigator.userAgent.match(/MSIE 10.0/))return!0;var e,t=document,n=t.head||t.getElementsByTagName("head")[0],r=t.createElement("style"),s=t.implementation||{hasFeature:function(){return!1}};r.type="text/css",n.insertBefore(r,n.firstChild),e=r.sheet||r.styleSheet;var i=s.hasFeature("CSS2","")?function(t){if(!e||!t)return!1;var n=!1;try{e.insertRule(t,0),n=!/unknown/i.test(e.cssRules[0].cssText),e.deleteRule(e.cssRules.length-1)}catch(r){}return n}:function(t){return e&&t?(e.cssText=t,0!==e.cssText.length&&!/unknown/i.test(e.cssText)&&0===e.cssText.replace(/\r+|\n+/g,"").indexOf(t.split(" ")[0])):!1};return i('@font-face{ font-family:"font";src:"font.ttf"; }')}();e&&(document.getElementsByTagName("html")[0].className+=" ff"),function(){var e=document.documentElement.style;("flexBasis"in e||"WebkitFlexBasis"in e||"msFlexBasis"in e)&&(document.documentElement.className+=" flex")}();var t,n,r,s,i,a,o={},u=function(){var e=document.documentElement.clientWidth,r=document.documentElement.clientHeight,s=window.innerWidth,i=window.innerHeight,a=s>1.5*e;t=a?e:s,n=a?r:i},c=function(e){var t=document.createElement("link");t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),t.setAttribute("href",r+e+s+".css"),t.setAttribute("media",a[e]),i.parentNode.insertBefore(t,i),delete a[e]},l=function(e,r,s){r&&!s&&(t>=r||n>=r)&&c(e),s&&!r&&(s>=t||s>=n)&&c(e),r&&s&&(t>=r||n>=r)&&(s>=t||s>=n)&&c(e)},f=function(e){if(o[e])return o[e];var t=e.match(/\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/),n=e.match(/\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/),r=t&&parseFloat(t[1])||null,s=n&&parseFloat(n[1])||null;return o[e]=[r,s],o[e]},m=function(){var e=0;for(var t in a)e++;return e},d=function(){m()||window.removeEventListener("resize",h,!1);for(var e in a){var t=a[e],n=f(t);l(e,n[0],n[1])}},h=function(){u(),d()},v=function(e,t){a=e,r=t.path+("/"!==t.path.substr(-1)?"/":""),s=t.postfix,i=t.insertBefore,u(),d(),window.addEventListener("resize",h,!1)};return{stylesheetLoaderInit:v}}(); var stylesheets = {"compact":"(max-width: 599px)","tablet":"(min-width: 600px)","wide":"(min-width: 1008px)"}; bootstrapUI.stylesheetLoaderInit(stylesheets, { path: 'http://static.bbci.co.uk/news/1.110.0511/stylesheets/services/news', postfix: '', insertBefore: insertPoint }); var loadRequire = function(){ var js_paths = {"jquery-1.9":"vendor\/jquery-1\/jquery","jquery-1":"http:\/\/static.bbci.co.uk\/frameworks\/jquery\/0.3.0\/sharedmodules\/jquery-1.7.2","demi-1":"http:\/\/static.bbci.co.uk\/frameworks\/demi\/0.10.0\/sharedmodules\/demi-1","swfobject-2":"http:\/\/static.bbci.co.uk\/frameworks\/swfobject\/0.1.10\/sharedmodules\/swfobject-2","jquery":"vendor\/jquery-2\/jquery.min","domReady":"vendor\/require\/domReady","translation":"module\/translations\/en-GB","bump-3":"\/\/emp.bbci.co.uk\/emp\/bump-3\/bump-3"};  js_paths.navigation = 'module/nav/navManager';  requirejs.config({ baseUrl: 'http://static.bbci.co.uk/news/1.110.0511/js', map: { 'vendor/locator': { 'module/bootstrap': 'vendor/locator/bootstrap', 'locator/stats': 'vendor/locator/stats', 'locator/locatorView': 'vendor/locator/locatorView' } }, paths: js_paths, waitSeconds: 30 }); define('config', function () { return config; });             require(["compiled\/all"], function() {
      require(['domReady'], function (domReady) { domReady(function () { require(["module\/dotcom\/handlerAdapter","module\/rumAdaptor","module\/stats\/statsSubscriberAdapter","module\/alternativeJsStrategy\/controller","module\/iconLoaderAdapter","module\/polyfill\/location.origin","module\/components\/breakingNewsAdapter","module\/indexTitleAdaptor","module\/findLocalNewsAdaptor","module\/navigation\/handlerAdaptor","module\/noTouchDetectionForCss","module\/components\/responsiveImage","module\/components\/timestampAdaptor","module\/tableScrollAdapter","module\/components\/mediaPlayer\/mainAdapter","module\/stats\/statsBindingAdapter","module\/hotspot\/handlerAdapter"], function() {  require(["module\/strategiserAdaptor"]);  }); }); });              });
     };  loadRequire();  } else { var l = document.createElement('link'); l.href = 'http://static.bbci.co.uk/news/1.110.0511/icons/generated/icons.fallback.css'; l.rel = 'stylesheet'; document.getElementsByTagName('head')[0].appendChild(l); } </script>  <script type="text/javascript"> /*<![CDATA[*/ bbcdotcom.init({adsToDisplay:['leaderboard', 'sponsor_section', 'mpu', 'outbrain_ar_5', 'outbrain_ar_7', 'outbrain_ar_8', 'outbrain_ar_9', 'native', 'mpu_bottom', 'adsense', 'inread']}); /*]]>*/ </script>      <noscript><link href="http://static.bbci.co.uk/news/1.110.0511/icons/generated/icons.fallback.css" rel="stylesheet"></noscript>

                
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=1">
    </head>
<!--[if IE]><body id="asset-type-sty" class="ie device--feature"><![endif]-->
<!--[if !IE]>--><body id="asset-type-sty" class="device--feature"><!--<![endif]-->
    <div class="direction" >

    
             <!-- BBCDOTCOM bodyFirst --><div id="bbccom_interstitial_ad" class="bbccom_display_none"></div><div id="bbccom_interstitial" class="bbccom_display_none"><script type="text/javascript"> /*<![CDATA[*/ (function() { if (window.bbcdotcom && bbcdotcom.config.isActive('ads')) { googletag.cmd.push(function() { googletag.display('bbccom_interstitial'); }); } }()); /*]]>*/ </script></div><div id="bbccom_wallpaper_ad" class="bbccom_display_none"></div><div id="bbccom_wallpaper" class="bbccom_display_none"><script type="text/javascript"> /*<![CDATA[*/ (function() { var wallpaper; if (window.bbcdotcom && bbcdotcom.config.isActive('ads')) { if (bbcdotcom.config.isAsync()) { googletag.cmd.push(function() { googletag.display('bbccom_wallpaper'); }); } else { googletag.display("wallpaper"); } wallpaper = bbcdotcom.adverts.adRegister.getAd('wallpaper'); if (wallpaper !== null && wallpaper !== undefined) { wallpaper.setDomElement('bbccom_wallpaper'); } } }()); /*]]>*/ </script></div><script type="text/javascript"> /*<![CDATA[*/ (function() { if (window.bbcdotcom && bbcdotcom.config.isActive('ads')) { document.write(unescape('%3Cscript id="gnlAdsEnabled" class="bbccom_display_none"%3E%3C/script%3E')); } if (window.bbcdotcom && bbcdotcom.config.isActive('analytics')) { document.write(unescape('%3Cscript id="gnlAnalyticsEnabled" class="bbccom_display_none"%3E%3C/script%3E')); } if (window.bbcdotcom && bbcdotcom.config.isActive('continuousPlay')) { document.write(unescape('%3Cscript id="gnlContinuousPlayEnabled" class="bbccom_display_none"%3E%3C/script%3E')); } }()); /*]]>*/ </script> <div id="blq-global"> <div id="blq-pre-mast">  </div> </div>  <script type="text/html" id="blq-bbccookies-tmpl"><![CDATA[ <section> <div id="bbccookies" class="bbccookies-banner orb-banner-wrapper bbccookies-d"> <div id="bbccookies-prompt" class="orb-banner b-g-p b-r b-f"> <h2 class="orb-banner-title"> Cookies on the BBC website </h2> <p class="orb-banner-content" dir="ltr"> The BBC has updated its cookie policy. We use cookies to ensure that we give you the best experience on our website. This includes cookies from third party social media websites if you visit a page which contains embedded content from social media. Such third party cookies may track your use of the BBC website.<span class="bbccookies-international-message"> We and our partners also use cookies to ensure we show you advertising that is relevant to you.</span> If you continue without changing your settings, we'll assume that you are happy to receive all cookies on the BBC website. However, you can change your cookie settings at any time. </p> <ul class="orb-banner-options"> <li id="bbccookies-continue"> <button type="button" id="bbccookies-continue-button">Continue</button> </li> <li id="bbccookies-settings"> <a href="/privacy/cookies/managing/cookie-settings.html">Change settings</a> </li> <li id="bbccookies-more"><a href="/privacy/cookies/bbc">Find out more</a></li></ul> </div> </div> </section> ]]></script> <script type="text/javascript">/*<![CDATA[*/ (function(){if(bbccookies._showPrompt()){var g=document,b=g.getElementById("blq-pre-mast"),e=g.getElementById("blq-bbccookies-tmpl"),a,f;if(b&&g.createElement){a=g.createElement("div");f=e.innerHTML;f=f.replace("<"+"![CDATA[","").replace("]]"+">","");a.innerHTML=f;b.appendChild(a);blqCookieContinueButton=g.getElementById("bbccookies-continue-button");blqCookieContinueButton.onclick=function(){a.parentNode.removeChild(a);return false};bbccookies._setPolicy(bbccookies.readPolicy())}var c=g.getElementById("bbccookies");if(c&&!window.orb.fig("uk")){c.className=c.className.replace(/\bbbccookies-d\b/,"");c.className=c.className+(" bbccookies-w")}}})(); /*]]>*/</script>   <script type="text/javascript">/*<![CDATA[*/ if (bbccookies.isAllowed('s1')) { require(['istats-1'], function (istats) {  istats.invoke(); }); } /*]]>*/</script>  <!-- Begin iStats 20100118 (UX-CMC 1.1009.3) --> <script type="text/javascript">/*<![CDATA[*/ if (bbccookies.isAllowed('s1')) { (function () { require(['istats-1'], function (istats) { istatsTrackingUrl = istats.getDefaultURL(); if (istats.isEnabled() && bbcFlagpoles_istats === 'ON') { sitestat(istatsTrackingUrl); } else { window.ns_pixelUrl = istatsTrackingUrl; /* used by Flash library to track */ } function sitestat(n) { var j = document, f = j.location, b = ""; if (j.cookie.indexOf("st_ux=") != -1) { var k = j.cookie.split(";"); var e = "st_ux", h = document.domain, a = "/"; if (typeof ns_ != "undefined" && typeof ns_.ux != "undefined") { e = ns_.ux.cName || e; h = ns_.ux.cDomain || h; a = ns_.ux.cPath || a } for (var g = 0, f = k.length; g < f; g++) { var m = k[g].indexOf("st_ux="); if (m != -1) { b = "&" + decodeURI(k[g].substring(m + 6)) } } bbccookies.set(e + "=; expires=" + new Date(new Date().getTime() - 60).toGMTString() + "; path=" + a + "; domain=" + h); } window.ns_pixelUrl = n;  } }); })(); } else { window.istats = {enabled: false}; } /*]]>*/</script> <noscript><p style="position: absolute; top: -999em;"><img src="//sa.bbc.co.uk/bbc/bbc/s?name=news.business.story.35530337.page&amp;cps_asset_id=35530337&amp;page_type=Story&amp;section=%2Fnews%2Fbusiness&amp;first_pub=2016-02-09T07%3A21%3A21%2B00%3A00&amp;last_editorial_update=2016-02-09T11%3A49%3A15%2B00%3A00&amp;curie=asset%3A33f514d5-ba98-7144-9ba9-2e916d436bef&amp;title=Google+boss+becomes+highest-paid+in+US&amp;topic_names=Pay%21Google%21Companies&amp;topic_ids=2f597db4-d7b4-49f6-9145-6209ed3de8fd%214795be02-dfe8-4a8d-b318-0609533ae17a%219f52c5bc-73a7-47c8-a6b5-e70eafbf6716&amp;for_nation=gb&amp;app_version=1.110.0&amp;bbc_site=news&amp;pal_route=asset&amp;ml_name=barlesque&amp;app_type=responsive&amp;language=en-GB&amp;ml_version=0.28.8&amp;pal_webapp=tabloid&amp;prod_name=news&amp;app_name=news&amp;blq_js_enabled=0&amp;blq_s=4d&amp;blq_r=2.7&amp;blq_v=default&amp;blq_e=pal " height="1" width="1" alt=""/></p></noscript> <!-- End iStats (UX-CMC) -->  
 <!--[if (gt IE 8) | (IEMobile)]><!--> <header id="orb-banner" role="banner"> <!--<![endif]--> <!--[if (lt IE 9) & (!IEMobile)]> <![if (IE 8)]> <header id="orb-banner" role="banner" class="orb-old-ie orb-ie8"> <![endif]> <![if (IE 7)]> <header id="orb-banner" role="banner" class="orb-old-ie orb-ie7"> <![endif]> <![if (IE 6)]> <header id="orb-banner" role="banner" class="orb-old-ie orb-ie6"> <![endif]> <![endif]--> <div id="orb-header"  class="orb-nav-pri orb-nav-pri-white b-header--white--black orb-nav-empty"  > <div class="orb-nav-pri-container b-r b-g-p"> <div class="orb-nav-section orb-nav-blocks"> <a href="/"> <img  src="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/img/bbc-blocks-dark.png" width="84" height="24" alt="BBC" /> </a> </div> <section> <div class="orb-skip-links"> <h2>Accessibility links</h2> <ul>  <li><a href="#page">Skip to content</a></li>  <li><a id="orb-accessibility-help" href="/accessibility/">Accessibility Help</a></li> </ul> </div> </section>  <div id="mybbc-wrapper" class="orb-nav-section orb-nav-id orb-nav-focus"> <div id="idcta-statusbar" class="orb-nav-section orb-nav-focus"> <a id="idcta-link" href="/id/status?ptrt=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337"> <span id="idcta-username">BBC iD</span> </a> </div>  <script type="text/javascript"> require(['idcta/statusbar'], function(statusbar) { new statusbar.Statusbar({"id":"idcta-statusbar","publiclyCacheable":true}); }); </script>

    <a id="notification-link" class="js-notification-link animated three" href="#">
        <span class="hidden-span">Notifications</span>
        <div class="notification-link--triangle"></div>
        <div class="notification-link--triangle"></div>
        <span id="not-num"></span>
    </a>
 </div>  <nav role="navigation" class="orb-nav"> <div class="orb-nav-section orb-nav-links orb-nav-focus" id="orb-nav-links"> <h2>BBC navigation</h2> <ul>    <li  class="orb-nav-news orb-d"  > <a href="http://www.bbc.co.uk/news/">News</a> </li>    <li  class="orb-nav-newsdotcom orb-w"  > <a href="http://www.bbc.com/news/">News</a> </li>    <li  class="orb-nav-sport"  > <a href="/sport/">Sport</a> </li>    <li  class="orb-nav-weather"  > <a href="/weather/">Weather</a> </li>    <li  class="orb-nav-shop orb-w"  > <a href="http://shop.bbc.com/">Shop</a> </li>    <li  class="orb-nav-earthdotcom orb-w"  > <a href="http://www.bbc.com/earth/">Earth</a> </li>    <li  class="orb-nav-travel-dotcom orb-w"  > <a href="http://www.bbc.com/travel/">Travel</a> </li>    <li  class="orb-nav-capital orb-w"  > <a href="http://www.bbc.com/capital/">Capital</a> </li>    <li  class="orb-nav-iplayer orb-d"  > <a href="/iplayer/">iPlayer</a> </li>    <li  class="orb-nav-culture orb-w"  > <a href="http://www.bbc.com/culture/">Culture</a> </li>    <li  class="orb-nav-autos orb-w"  > <a href="http://www.bbc.com/autos/">Autos</a> </li>    <li  class="orb-nav-future orb-w"  > <a href="http://www.bbc.com/future/">Future</a> </li>    <li  class="orb-nav-tv"  > <a href="/tv/">TV</a> </li>    <li  class="orb-nav-radio"  > <a href="/radio/">Radio</a> </li>    <li  class="orb-nav-cbbc"  > <a href="/cbbc">CBBC</a> </li>    <li  class="orb-nav-cbeebies"  > <a href="/cbeebies">CBeebies</a> </li>    <li  class="orb-nav-food"  > <a href="/food/">Food</a> </li>    <li  > <a href="/iwonder">iWonder</a> </li>    <li  > <a href="/education">Bitesize</a> </li>    <li  class="orb-nav-travel orb-d"  > <a href="/travel/">Travel</a> </li>    <li  class="orb-nav-music"  > <a href="/music/">Music</a> </li>    <li  class="orb-nav-earth orb-d"  > <a href="http://www.bbc.com/earth/">Earth</a> </li>    <li  class="orb-nav-arts"  > <a href="/arts/">Arts</a> </li>    <li  class="orb-nav-makeitdigital"  > <a href="/makeitdigital">Make It Digital</a> </li>    <li  > <a href="/taster">Taster</a> </li>    <li  class="orb-nav-nature orb-w"  > <a href="/nature/">Nature</a> </li>    <li  class="orb-nav-local"  > <a href="/local/">Local</a> </li>    <li id="orb-nav-more"><a href="#orb-footer" data-alt="More">Menu<span class="orb-icon orb-icon-arrow"></span></a></li> </ul> </div> </nav> <div class="orb-nav-section orb-nav-search"> <a href="http://search.bbc.co.uk/search"> <img  src="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/img/orb-search-dark.png" width="18" height="18" alt="Search the BBC" /> </a> <form class="b-f" id="orb-search-form" role="search" method="get" action="http://search.bbc.co.uk/search" accept-charset="utf-8"> <div>  <input type="hidden" name="uri" value="/news/business-35530337" />   <label for="orb-search-q">Search the BBC</label> <input id="orb-search-q" type="text" name="q" placeholder="Search" /> <input type="image" id="orb-search-button" src="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/img/orb-search-dark.png" width="17" height="17" alt="Search the BBC" /> <input type="hidden" name="suggid" id="orb-search-suggid" /> </div> </form> </div> </div> <div id="orb-panels"  > <script type="text/template" id="orb-panel-template"><![CDATA[ <div id="orb-panel-<%= panelname %>" class="orb-panel" aria-labelledby="orb-nav-<%= panelname %>"> <div class="orb-panel-content b-g-p b-r"> <%= panelcontent %> </div> </div> ]]></script> </div> </div> </header> <!-- Styling hook for shared modules only --> <div id="orb-modules">             
    <div id="site-container">

    <!--[if lt IE 9]>
<div class="browser-notify">
    <div class="browser-notify__banner">
        <div class="browser-notify__icon"></div>
        <span>This site is optimised for modern web browsers, and does not fully support your version of Internet Explorer</span>
    </div>
</div>
<![endif]-->            <div class="site-brand site-brand--height" role="banner" aria-label="News">
                        <div class="site-brand-inner site-brand-inner--height">
                <div class="navigation navigation--primary">
                    <a href="/news" id="brand">
            <svg class="brand__svg" aria-label="BBC News">
            <title>BBC News</title>
            <image xlink:href="http://static.bbci.co.uk/news/1.110.0511/img/brand/generated/news-light.svg" src="http://static.bbci.co.uk/news/1.110.0511/img/brand/generated/news-light.png" width="100%" height="100%"/>
        </svg>
        </a>
                                        <h2 class="navigation__heading off-screen">News navigation</h2>
                    <a href="#core-navigation" class="navigation__section navigation__section--core" data-event="header">
                        Sections                    </a>
                    <div class="find-local-wide" id="find-local-wide">
    <button class="find-local-wide__link">Find local news</button>
</div>
                </div>
            </div>
                        

<div class="navigation navigation--wide">
    <ul class="navigation-wide-list" role="navigation" aria-label="News" data-panel-id="js-navigation-panel-primary">
                    <li>
                <a href="/news" class="navigation-wide-list__link">
                    <span>Home</span>
                </a>
                            </li>
                    <li>
                <a href="/news/uk" data-panel-id="js-navigation-panel-UK" class="navigation-wide-list__link">
                    <span>UK</span>
                </a>
                            </li>
                    <li>
                <a href="/news/world" data-panel-id="js-navigation-panel-World" class="navigation-wide-list__link">
                    <span>World</span>
                </a>
                            </li>
                    <li class="selected">
                <a href="/news/business" data-panel-id="js-navigation-panel-Business" class="navigation-wide-list__link navigation-arrow--open">
                    <span>Business</span>
                </a>
                 <span class="off-screen">selected</span>            </li>
                    <li>
                <a href="/news/politics" data-panel-id="js-navigation-panel-Politics" class="navigation-wide-list__link">
                    <span>Politics</span>
                </a>
                            </li>
                    <li>
                <a href="/news/technology" class="navigation-wide-list__link">
                    <span>Tech</span>
                </a>
                            </li>
                    <li>
                <a href="/news/science_and_environment" class="navigation-wide-list__link">
                    <span>Science</span>
                </a>
                            </li>
                    <li>
                <a href="/news/health" class="navigation-wide-list__link">
                    <span>Health</span>
                </a>
                            </li>
                    <li>
                <a href="/news/education" data-panel-id="js-navigation-panel-Education" class="navigation-wide-list__link">
                    <span>Education</span>
                </a>
                            </li>
                    <li>
                <a href="/news/entertainment_and_arts" class="navigation-wide-list__link">
                    <span>Entertainment &amp; Arts</span>
                </a>
                            </li>
                    <li>
                <a href="/news/video_and_audio/video" class="navigation-wide-list__link">
                    <span>Video &amp; Audio</span>
                </a>
                            </li>
                    <li>
                <a href="/news/magazine" class="navigation-wide-list__link">
                    <span>Magazine</span>
                </a>
                            </li>
                    <li>
                <a href="/news/in_pictures" class="navigation-wide-list__link">
                    <span>In Pictures</span>
                </a>
                            </li>
                    <li>
                <a href="/news/also_in_the_news" class="navigation-wide-list__link">
                    <span>Also in the News</span>
                </a>
                            </li>
                    <li>
                <a href="/news/special_reports" class="navigation-wide-list__link">
                    <span>Special Reports</span>
                </a>
                            </li>
                    <li>
                <a href="/news/explainers" class="navigation-wide-list__link">
                    <span>Explainers</span>
                </a>
                            </li>
                    <li>
                <a href="/news/the_reporters" class="navigation-wide-list__link">
                    <span>The Reporters</span>
                </a>
                            </li>
                    <li>
                <a href="/news/have_your_say" class="navigation-wide-list__link">
                    <span>Have Your Say</span>
                </a>
                            </li>
                    <li>
                <a href="/news/disability" class="navigation-wide-list__link navigation-wide-list__link--last">
                    <span>Disability</span>
                </a>
                            </li>
            </ul>
</div>

    <div class="secondary-navigation secondary-navigation--wide">
        <nav class="navigation-wide-list navigation-wide-list--secondary" role="navigation" aria-label="Business">
            <a class="secondary-navigation__title navigation-wide-list__link selected" href="/news/business"><span>Business</span></a> <span class="off-screen">selected</span>                            <ul data-panel-id="js-navigation-panel-secondary">
                                            <li>
                            <a href="/news/business/your_money"
                                class="navigation-wide-list__link navigation-wide-list__link--first ">
                                <span>Your Money</span>
                            </a>
                                                    </li>
                                            <li>
                            <a href="http://www.bbc.co.uk/news/business/market_data"
                                class="navigation-wide-list__link  ">
                                <span>Market Data</span>
                            </a>
                                                    </li>
                                            <li>
                            <a href="/news/business/markets"
                                class="navigation-wide-list__link  ">
                                <span>Markets</span>
                            </a>
                                                    </li>
                                            <li>
                            <a href="/news/business/companies"
                                class="navigation-wide-list__link  ">
                                <span>Companies</span>
                            </a>
                                                    </li>
                                            <li>
                            <a href="/news/business/economy"
                                class="navigation-wide-list__link  navigation-wide-list__link--last">
                                <span>Economy</span>
                            </a>
                                                    </li>
                                    </ul>
                    </nav>
    </div>
                    </div>
            
    
<div id="bbccom_leaderboard_1_2_3_4" class="bbccom_slot "  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('leaderboard', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>

    <div id="breaking-news-container" data-polling-url="http://polling.bbc.co.uk/news/latest_breaking_news?audience=Domestic" aria-live="polite"></div>

                        <div class="container-width-only">
                            <span class="index-title index-title--redundant " id="comp-index-title" data-index-title-meta="{&quot;id&quot;:&quot;comp-index-title&quot;,&quot;type&quot;:&quot;index-title&quot;,&quot;handler&quot;:&quot;indexTitle&quot;,&quot;deviceGroups&quot;:null,&quot;opts&quot;:{&quot;alwaysVisible&quot;:false,&quot;onFrontPage&quot;:false},&quot;template&quot;:&quot;index-title&quot;}">
        <span class="index-title__container">
            <a href="/news/business">Business</a>
        </span>
    </span>
            
<div id="bbccom_sponsor_section_1_2_3_4" class="bbccom_slot "  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('sponsor_section', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>
            </div>
            
         <div id="page" class="configurable story " data-story-id="business-35530337"> <div id="breaking-news-banner-focus-target" tabindex="-1"></div>      <div role="main"> <div class="container-width-only">       <span class="index-title index-title--redundant " id="comp-index-title" data-index-title-meta="{&quot;id&quot;:&quot;comp-index-title&quot;,&quot;type&quot;:&quot;index-title&quot;,&quot;handler&quot;:&quot;indexTitle&quot;,&quot;deviceGroups&quot;:null,&quot;opts&quot;:{&quot;alwaysVisible&quot;:false,&quot;onFrontPage&quot;:false},&quot;template&quot;:&quot;index-title&quot;}">
        <span class="index-title__container">
            <a href="/news/business">Business</a>
        </span>
    </span>
 
<div id="bbccom_sponsor_section_1_2_3_4" class="bbccom_slot "  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('sponsor_section', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>
   </div>      <div class="container">       <div class="container--primary-and-secondary-columns column-clearfix">                         <div class="column--primary">
                                                                            <div class="story-body">
    <h1 class="story-body__h1">Google boss becomes highest-paid in US</h1>

    
    <div class="story-body__mini-info-list-and-share">
        <ul class="mini-info-list">
    <li class="mini-info-list__item">    <div class="date date--v2" data-seconds="1455018555" data-datetime="9 February 2016">9 February 2016</div>
</li>
            <li class="mini-info-list__item"><span class="mini-info-list__section-desc off-screen">From the section </span><a href="/news/business" class="mini-info-list__section" data-entityid="section-label">Business</a></li>
</ul>
            </div>

    <div class="story-body__inner" property="articleBody">
                                                                                                    <figure class="media-landscape no-caption full-width lead">
            <span class="image-and-copyright-container">
                
                <img class="js-image-replace" alt="Sundar Pichai," src="http://ichef-1.bbci.co.uk/news/320/cpsprodpb/6F15/production/_88173482_88173481.jpg" width="976" height="549">
                
                
                
                 <span class="off-screen">Image copyright</span>
                 <span class="story-image-copyright">Getty Images</span>
                
            </span>
            
        </figure><p class="story-body__introduction">The chief executive of Google, Sundar Pichai, has been awarded $199m (£138m) in shares, a regulatory filing has revealed.</p><p>It makes him the highest-paid chief executive in the US.</p><p>Mr Pichai became chief executive of the search engine giant following the creation of its parent, Alphabet.</p><p>The founders of Google, Larry Page and Sergey Brin, have amassed fortunes of $34.6bn and $33.9bn, according to Forbes.</p><p>Mr Pichai, 43, was awarded 273,328 Alphabet shares on 3 February, worth a total of $199m, according to a filing with the <a href="http://www.sec.gov/Archives/edgar/data/1534753/000112760216039906/xslF345X03/form4.xml" class="story-body__link-external">US Securities and Exchange Commission</a>. </p><div id="bbccom_mpu_1_2_3" class="bbccom_slot mpu-ad" aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /**/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('mpu', [1,2,3]);
                }
            })();
            /**/
        </script>
    </div>
</div>
   `
const bbcNews2 = `<p>
The new award of shares takes Mr Pichai's total stock value to approximately $650m.</p><p>Mr Pichai's share award will vest incrementally each quarter until 2019. In other words, full control over the shares will pass to him on a gradual basis.</p><p>The Google chief executive joined the company since 2004, initially leading product management on a number of Google's client software products, including Google Chrome] and Chrome OS, as well as being largely responsible for Google Drive. He also oversaw the development of Gmail and Google Maps.</p>                                                                                                    <p>He previously worked in engineering and product management at Applied Materials and as a management consultant at McKinsey &amp; Company.</p><p>It comes at a time of heightened scrutiny of Google's tax affairs, following the company's deal with HM Revenue &amp; Customs to pay back taxes dating from 2005. </p><p>The controversial tax deal was labelled derisory by Labour. Shadow Chancellor John McDonnell called for greater transparency, saying it looked like a "sweetheart deal".</p><p>"HMRC seems to have settled for a relatively small amount in comparison with the overall profits that are made by the company in this country.  And some of the independent analysts have argued that it should be at least 10 times this amount," he said.</p><p><a href="https://abc.xyz/investor/pdf/20141231_google_10K.pdf" class="story-body__link-external">Google's regulatory filings</a> for for the period 2005 to 2014, show it generated sales of £24bn ($34.6bn) in the UK during the period with an estimated profit of about £7.2bn on those sales. Page 83 of its most recent 10k report states "revenues by geography are based on the billing addresses of our customers".</p><p>Last week, Alphabet - Google's parent company - surpassed Apple as the world's most valuable firm after it reported a profit of $4.9bn (£3.4bn) in the three months to the end of December, an increase from $4.7bn a year ago.</p><p>On an annual basis, Alphabet made $16.3bn, but the figures showed that the "Other Bets" business lost $3.6bn during the period, while Google's operating income rose to $23.4bn, as online advertising increased.</p><p><i>An earlier version of this story included a table featuring a list of highest-paid CEOs in the US, which had figures from 2012, not 2015.</i></p>
                                                                                                </div>
</div>
                                                                                                <div class="share share--lightweight  show ghost-column">
            <div id="share-tools"></div>
            <h2 class="share__title share__title--lightweight">
        Share this story        <a href="http://www.bbc.co.uk/help/web/sharing.shtml">About&nbsp;sharing</a>
    </h2>
        <ul class="share__tools share__tools--lightweight">
                            <li class="share__tool share__tool--email">
        <a href="mailto:?subject=Shared%20from%20BBC%20News&body=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337" >
            <span>Email</span>
        </a>
    </li>
                            <li class="share__tool share__tool--facebook">
        <a href="http://www.facebook.com/dialog/feed?app_id=58567469885&redirect_uri=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337&link=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337%3FSThisFB" >
            <span>Facebook</span>
        </a>
    </li>
                            <li class="share__tool share__tool--twitter">
        <a href="https://twitter.com/intent/tweet?text=BBC%20News%20-%20Google%20boss%20becomes%20highest-paid%20in%20US&url=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337" class=shortenUrl data-social-url=https://twitter.com/intent/tweet?text=BBC+News+-+Google+boss+becomes+highest-paid+in+US&amp;url= data-target-url=http://www.bbc.co.uk/news/business-35530337>
            <span>Twitter</span>
        </a>
    </li>
                            <li class="share__tool share__tool--whatsapp">
        <a href="whatsapp://send?text=BBC%20News%20%7C%20Google%20boss%20becomes%20highest-paid%20in%20US%20-%20http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337%3Focid%3Dwsnews.chat-apps.in-app-msg.whatsapp.trial.link1_.auin" >
            <span>WhatsApp</span>
        </a>
    </li>
                            <li class="share__tool share__tool--linkedin">
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=http%3A%2F%2Fwww.bbc.co.uk%2Fnews%2Fbusiness-35530337&title=Google%20boss%20becomes%20highest-paid%20in%20US&summary=The%20chief%20executive%20of%20Google%2C%20Sundar%20Pichai%2C%20has%20been%20awarded%20%24199m%20%28%C2%A3138m%29%20in%20shares%2C%20a%20regulatory%20filing%20reveals.&source=BBC" >
            <span>Linkedin</span>
        </a>
    </li>
            </ul>
</div>

                                                                                                <div class="story-more">
          <div class="group story-alsos more-on-this-story"> <div class="group__header"> <h2 class="group__title">More on this story</h2> </div> <div class="group__body"> <ul class="units-list ">    <li class="unit unit--regular" data-entityid="more-on-this-story#1" >  <a href="/news/business-35428966" class="unit__link-wrapper"> <div class="unit__body"> <div class="unit__header">  <div class="unit__title">     <span class="cta"> Google tax row: What's behind the deal? </span> </div>    <div class="unit__meta"> <div class="date date--v1" data-seconds="1454004266" data-datetime="28 January 2016">28 January 2016</div> </div>  </div> </div> </a>  </li>     <li class="unit unit--regular" data-entityid="more-on-this-story#2" >  <a href="/news/uk-35390692" class="unit__link-wrapper"> <div class="unit__body"> <div class="unit__header">  <div class="unit__title">     <span class="cta"> Google tax deal labelled 'derisory', as criticism grows </span> </div>    <div class="unit__meta"> <div class="date date--v1" data-seconds="1453560404" data-datetime="23 January 2016">23 January 2016</div> </div>  </div> </div> </a>  </li>     <li class="unit unit--regular" data-entityid="more-on-this-story#3" >  <a href="/news/business-33952393" class="unit__link-wrapper"> <div class="unit__body"> <div class="unit__header">  <div class="unit__title">     <span class="cta"> Chief executives earn '183 times more than workers' </span> </div>    <div class="unit__meta"> <div class="date date--v1" data-seconds="1439796160" data-datetime="17 August 2015">17 August 2015</div> </div>  </div> </div> </a>  </li>     <li class="unit unit--regular" data-entityid="more-on-this-story#4" >  <a href="/news/business-35230845" class="unit__link-wrapper"> <div class="unit__body"> <div class="unit__header">  <div class="unit__title">     <span class="cta"> 'Fat cat Tuesday' as top bosses pay overtakes UK workers </span> </div>    <div class="unit__meta"> <div class="date date--v1" data-seconds="1451984722" data-datetime="5 January 2016">5 January 2016</div> </div>  </div> </div> </a>  </li>     <li class="unit unit--regular" data-entityid="more-on-this-story#5" >  <a href="/news/business-35464599" class="unit__link-wrapper"> <div class="unit__body"> <div class="unit__header">  <div class="unit__title">     <span class="cta"> Alphabet - owner of Google - takes top spot from Apple </span> </div>    <div class="unit__meta"> <div class="date date--v1" data-seconds="1454370041" data-datetime="1 February 2016">1 February 2016</div> </div>  </div> </div> </a>  </li>   </ul> </div> </div>      </div>
                                                                                            
                                                                                                    <div id=comp-pattern-library-3
            class="hidden"
            data-post-load-url="/news/pattern-library-components?options%5BassetId%5D=35530337&amp;options%5Bcontainer_class%5D=container-more-from-this-index&amp;options%5Bdata%5D%5Bsource%5D=candy_parent_index&amp;options%5Bdata%5D%5Bsource_params%5D%5Bsection_title%5D=1&amp;options%5Bcomponents%5D%5B0%5D%5Bname%5D=sparrow&amp;options%5Bcomponents%5D%5B0%5D%5Blimit%5D=3&amp;options%5Bloading_strategy%5D=post_load&amp;options%5Bstats%5D%5Blink_location%5D=more-section&amp;options%5Basset_id%5D=business-35530337&amp;presenter=pattern-library-presenter">
        </div>                                                                                                    <div id=comp-from-other-news-sites
            class="hidden"
            data-comp-meta="{&quot;id&quot;:&quot;comp-from-other-news-sites&quot;,&quot;type&quot;:&quot;from-other-news-sites&quot;,&quot;handler&quot;:&quot;default&quot;,&quot;deviceGroups&quot;:null,&quot;opts&quot;:{&quot;assetId&quot;:&quot;35530337&quot;,&quot;conditions&quot;:[&quot;is_local_page&quot;],&quot;loading_strategy&quot;:&quot;post_load&quot;,&quot;asset_id&quot;:&quot;business-35530337&quot;,&quot;position_info&quot;:{&quot;instanceNo&quot;:1,&quot;positionInRegion&quot;:9,&quot;lastInRegion&quot;:true,&quot;lastOnPage&quot;:false,&quot;column&quot;:&quot;primary_column&quot;}},&quot;template&quot;:&quot;\/component\/from-other-news-sites&quot;}">
        </div>                                
<div id="bbccom_outbrain_ar_5_1_2_3_4" class="bbccom_slot outbrain-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('outbrain_ar_5', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>

<div id="bbccom_outbrain_ar_7_1_2_3_4" class="bbccom_slot outbrain-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('outbrain_ar_7', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>

<div id="bbccom_outbrain_ar_8_1_2_3_4" class="bbccom_slot outbrain-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('outbrain_ar_8', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>
                                        </div>
                                     <div class="column--secondary" role="complementary">
                                                                            <div id="comp-top-stories-promo" class="top-stories-promo">
    <h2 class="top-stories-promo__title">Top Stories</h2>
                    <a href="/news/world-us-canada-35538361" class="top-stories-promo-story" data-asset-id="/news/world-us-canada-35538361"data-entityid="top-stories#1">
        <strong class="top-stories-promo-story__title">Trump and Sanders win New Hampshire</strong>
                    <p class="top-stories-promo-story__summary ">Donald Trump and Bernie Sanders both win decisive victories in the New Hampshire primary, the second contest in the race for US presidential nominees.</p>
                    <div class="date date--v2" data-seconds="1455099626" data-datetime="10 February 2016">10 February 2016</div>
    </a>
                    <a href="/news/health-35535704" class="top-stories-promo-story" data-asset-id="/news/health-35535704"data-entityid="top-stories#3">
        <strong class="top-stories-promo-story__title">Junior doctors begin second strike</strong>
                    <div class="date date--v2" data-seconds="1455091210" data-datetime="10 February 2016">10 February 2016</div>
    </a>
                    <a href="/news/uk-england-35539761" class="top-stories-promo-story" data-asset-id="/news/uk-england-35539761"data-entityid="top-stories#5">
        <strong class="top-stories-promo-story__title">Milly Dowler torment revealed by family</strong>
                    <div class="date date--v2" data-seconds="1455099516" data-datetime="10 February 2016">10 February 2016</div>
    </a>
        </div>                                
<div id="bbccom_mpu_4" class="bbccom_slot mpu-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('mpu', [4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>
                                                            <div class="hotspot hotspot--empty hotspot--hidden"></div>
                                                                                            
<div class="features-and-analysis" id="comp-features-and-analysis" >
    <h2 class="features-and-analysis__title">
        
        Features
    </h2>
    <div class="features-and-analysis__stories promo-unit-spacer">
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#1">
            <a href="/news/magazine-35521559" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef.bbci.co.uk/news/304/cpsprodpb/139C8/production/_88182308_2014-squad.jpg" data-width="976" data-height="549" data-alt="England squad in suits 2014"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef.bbci.co.uk/news/304/cpsprodpb/139C8/production/_88182308_2014-squad.jpg" class="js-image-replace" alt="England squad in suits 2014" width="976" height="549" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Made in... </h3>
                <p class="bold-image-promo__summary">Can an English suit come from Cambodia?</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#2">
            <a href="/news/magazine-35328524" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/138CE/production/_88187008_eames-promo-alamy.jpg" data-width="976" data-height="549" data-alt="Man in Eames lounge chair"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/138CE/production/_88187008_eames-promo-alamy.jpg" class="js-image-replace" alt="Man in Eames lounge chair" width="976" height="549" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">A 50s classic</h3>
                <p class="bold-image-promo__summary">The chair designed to fit like a baseball glove</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#3">
            <a href="/news/world-asia-india-35529867" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef.bbci.co.uk/news/304/cpsprodpb/80D1/production/_88177923_gettyimages-151094370.jpg" data-width="976" data-height="549" data-alt="Baba Ramdev"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef.bbci.co.uk/news/304/cpsprodpb/80D1/production/_88177923_gettyimages-151094370.jpg" class="js-image-replace" alt="Baba Ramdev" width="976" height="549" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Spiritual capitalism</h3>
                <p class="bold-image-promo__summary">Why do Indian gurus sell noodles?</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#4">
            <a href="/news/magazine-35483650" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                <div class="responsive-image__inner-for-label"><!-- closed in responsive-image-end -->
                                    <div class="js-delayed-image-load" data-src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/124FE/production/_88160057_kasparovandjudit.jpg" data-width="640" data-height="360" data-alt="Judit Polgar vs Garry Kasparov"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/124FE/production/_88160057_kasparovandjudit.jpg" class="js-image-replace" alt="Judit Polgar vs Garry Kasparov" width="640" height="360" />
                                    <![endif]-->
                                    <div class="responsive-image__label" aria-hidden="true">
                                                <span class="icon video"><span class="off-screen"> Video</span></span>
                                                
                                                
                                                
                                            <span class="responsive-image__label-text">4:00</span>
                                    </div>
                                <!-- opened in responsive-image-start --></div>
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Checkmate</h3>
                <p class="bold-image-promo__summary">The day Judit Polgar beat Garry Kasparov</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#5">
            <a href="/news/world-africa-35534420" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef.bbci.co.uk/news/304/cpsprodpb/D19A/production/_88185635_thubi.jpg" data-width="976" data-height="549" data-alt="Thubelihle Dlodlo"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef.bbci.co.uk/news/304/cpsprodpb/D19A/production/_88185635_thubi.jpg" class="js-image-replace" alt="Thubelihle Dlodlo" width="976" height="549" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Virgin scholarships</h3>
                <p class="bold-image-promo__summary">The S African mayor who wants schoolgirls to stay 'pure'</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#6">
            <a href="/news/world-asia-35468785" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/D45C/production/_88046345_hawparvilla-38.jpg" data-width="2048" data-height="1152" data-alt="Picture of statues at Singapore's Haw Par Villa"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/D45C/production/_88046345_hawparvilla-38.jpg" class="js-image-replace" alt="Picture of statues at Singapore's Haw Par Villa" width="2048" height="1152" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Dying trade</h3>
                <p class="bold-image-promo__summary">The last artisan at Singapore's strangest theme park</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#7">
            <a href="/news/business-35318236" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/7AC4/production/_88182413_gettyimages-156661060.jpg" data-width="1024" data-height="576" data-alt="Buildings of The Barcode Project are reflected on the water at sunset in Oslo"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef-1.bbci.co.uk/news/304/cpsprodpb/7AC4/production/_88182413_gettyimages-156661060.jpg" class="js-image-replace" alt="Buildings of The Barcode Project are reflected on the water at sunset in Oslo" width="1024" height="576" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Norwegian shift</h3>
                <p class="bold-image-promo__summary">Norway seeks to diversify its economy as oil earnings plunge</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#8">
            <a href="/news/magazine-35531143" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef.bbci.co.uk/news/304/cpsprodpb/C271/production/_88177794_hi031350031.jpg" data-width="2048" data-height="1152" data-alt="A man leans into the wind on the beach at Newhaven, southern England"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef.bbci.co.uk/news/304/cpsprodpb/C271/production/_88177794_hi031350031.jpg" class="js-image-replace" alt="A man leans into the wind on the beach at Newhaven, southern England" width="2048" height="1152" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Nine storms</h3>
                <p class="bold-image-promo__summary">Has the weather in the UK really been rougher this winter?</p>
            </a>
        </div>
        
        
        <div class="features-and-analysis__story"  data-entityid="features-and-analysis#9">
            <a href="/news/magazine-35521560" class="bold-image-promo">
                <div class="bold-image-promo__image">
                            <div class="responsive-image responsive-image--16by9">
                                
                                    <div class="js-delayed-image-load" data-src="http://ichef.bbci.co.uk/news/304/cpsprodpb/11270/production/_88165207_whiteish.jpg" data-width="976" data-height="549" data-alt="Woman lies back in flotation tank"></div>
                                    <!--[if lt IE 9]>
                                    <img src="http://ichef.bbci.co.uk/news/304/cpsprodpb/11270/production/_88165207_whiteish.jpg" class="js-image-replace" alt="Woman lies back in flotation tank" width="976" height="549" />
                                    <![endif]-->
                                
                            </div>
                </div>
                <h3 class="bold-image-promo__title">Hippy resting pod</h3>
                <p class="bold-image-promo__summary">Why the new-age flotation tank has soared in popularity</p>
            </a>
        </div>
        
    </div>
</div>
                                
<div id="bbccom_native_1_2_3_4" class="bbccom_slot native-ad"  >
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('native', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>
                                                                    <div id=comp-most-popular
            class="hidden"
            data-comp-meta="{&quot;id&quot;:&quot;comp-most-popular&quot;,&quot;type&quot;:&quot;most-popular&quot;,&quot;handler&quot;:&quot;mostPopular&quot;,&quot;deviceGroups&quot;:null,&quot;opts&quot;:{&quot;assetId&quot;:&quot;35530337&quot;,&quot;loading_strategy&quot;:&quot;post_load&quot;,&quot;position_info&quot;:{&quot;instanceNo&quot;:1,&quot;positionInRegion&quot;:4,&quot;lastInRegion&quot;:true,&quot;lastOnPage&quot;:true,&quot;column&quot;:&quot;secondary_column&quot;}}}">
        </div>                                
<div id="bbccom_mpu_bottom_1_2_3_4" class="bbccom_slot mpu-bottom-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('mpu_bottom', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>

<div id="bbccom_outbrain_ar_9_1_2_3_4" class="bbccom_slot outbrain-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('outbrain_ar_9', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>

<div id="bbccom_adsense_1_2_3_4" class="bbccom_slot adsense-ad"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('adsense', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>

<div id="bbccom_inread_1_2_3_4" class="bbccom_slot inread"  aria-hidden="true">
    <div class="bbccom_advert">
        <script type="text/javascript">
            /*<![CDATA[*/
            (function() {
                if (window.bbcdotcom && bbcdotcom.adverts && bbcdotcom.adverts.slotAsync) {
                    bbcdotcom.adverts.slotAsync('inread', [1,2,3,4]);
                }
            })();
            /*]]>*/
        </script>
    </div>
</div>
                                        </div>
             </div>          </div> </div>      </div> 
   

<div id="core-navigation" class="navigation--footer">
    <h2 class="navigation--footer__heading">News navigation</h2>

            <nav id="secondary-navigation--bottom" class="secondary-navigation--bottom" role="navigation" aria-label="Business">
            <a class="secondary-navigation__title navigation-arrow selected" href="/news/business"><span>Business</span></a>
                            <span class="navigation-core-title"><span>Sections</span></span>
                <ul class="secondary-navigation--bottom__toplevel">
                                                            <li>
                        <a href="/news/business/your_money"><span>Your Money</span></a>
                                            </li>
                                        <li>
                        <a href="http://www.bbc.co.uk/news/business/market_data"><span>Market Data</span></a>
                                            </li>
                                        <li>
                        <a href="/news/business/markets"><span>Markets</span></a>
                                            </li>
                                        <li>
                        <a href="/news/business/companies"><span>Companies</span></a>
                                            </li>
                                        <li>
                        <a href="/news/business/economy"><span>Economy</span></a>
                                            </li>
                                    </ul>
                    </nav>
    
    <nav id="navigation--bottom" class="navigation navigation--bottom core--with-secondary" role="navigation" aria-label="News">
                <ul class="navigation--bottom__toplevel">
                        <li class="">
                    <a href="/news" class="">
                        <span>Home</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/uk" data-panel-id="js-navigation-panel-UK" class="navigation-arrow">
                        <span>UK</span>
                    </a>
                                                                <div class="navigation-panel navigation-panel--closed js-navigation-panel-UK">
                            <div class="navigation-panel__content">
                                <ul class="navigation-panel-secondary">
                                    <li><a href="/news/uk"><span>UK Home</span></a></li>
                                                                                                                    <li>
                                            <a href="/news/england"><span>England</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/northern_ireland"><span>N. Ireland</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/scotland"><span>Scotland</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/naidheachdan"><span>Alba</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/wales"><span>Wales</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/cymrufyw"><span>Cymru</span></a>                                        </li>
                                                                                                            </ul>
                            </div>
                        </div>
                                    </li>
                            <li class="">
                    <a href="/news/world" data-panel-id="js-navigation-panel-World" class="navigation-arrow">
                        <span>World</span>
                    </a>
                                                                <div class="navigation-panel navigation-panel--closed js-navigation-panel-World">
                            <div class="navigation-panel__content">
                                <ul class="navigation-panel-secondary">
                                    <li><a href="/news/world"><span>World Home</span></a></li>
                                                                                                                    <li>
                                            <a href="/news/world/africa"><span>Africa</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/world/asia"><span>Asia</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/world/australia"><span>Australia</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/world/europe"><span>Europe</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/world/latin_america"><span>Latin America</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/world/middle_east"><span>Middle East</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/world/us_and_canada"><span>US &amp; Canada</span></a>                                        </li>
                                                                                                            </ul>
                            </div>
                        </div>
                                    </li>
                            <li class="selected navigation-list-item--open">
                    <a href="/news/business" data-panel-id="js-navigation-panel-Business" class="navigation-arrow navigation-arrow--open">
                        <span>Business</span>
                    </a>
                     <span class="off-screen">selected</span>                                            <div class="navigation-panel js-navigation-panel-Business">
                            <div class="navigation-panel__content">
                                <ul class="navigation-panel-secondary">
                                    <li><a href="/news/business"><span>Business Home</span></a></li>
                                                                                                                    <li>
                                            <a href="/news/business/your_money"><span>Your Money</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="http://www.bbc.co.uk/news/business/market_data"><span>Market Data</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/business/markets"><span>Markets</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/business/companies"><span>Companies</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/business/economy"><span>Economy</span></a>                                        </li>
                                                                                                            </ul>
                            </div>
                        </div>
                                    </li>
                            <li class="">
                    <a href="/news/politics" data-panel-id="js-navigation-panel-Politics" class="navigation-arrow">
                        <span>Politics</span>
                    </a>
                                                                <div class="navigation-panel navigation-panel--closed js-navigation-panel-Politics">
                            <div class="navigation-panel__content">
                                <ul class="navigation-panel-secondary">
                                    <li><a href="/news/politics"><span>Politics Home</span></a></li>
                                                                                                                    <li>
                                            <a href="/news/politics/parliaments"><span>Parliaments</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/politics/eu_referendum"><span>EU Referendum</span></a>                                        </li>
                                                                                                                                                            <li>
                                            <a href="/news/election/us2016"><span>US Election 2016</span></a>                                        </li>
                                                                                                                                                                                                                                                                    </ul>
                            </div>
                        </div>
                                    </li>
                            <li class="">
                    <a href="/news/technology" class="">
                        <span>Tech</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/science_and_environment" class="">
                        <span>Science</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/health" class="">
                        <span>Health</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/education" data-panel-id="js-navigation-panel-Education" class="navigation-arrow">
                        <span>Education</span>
                    </a>
                                                                <div class="navigation-panel navigation-panel--closed js-navigation-panel-Education">
                            <div class="navigation-panel__content">
                                <ul class="navigation-panel-secondary">
                                    <li><a href="/news/education"><span>Education Home</span></a></li>
                                                                                                                    <li>
                                            <a href="/schoolreport"><span>School Report</span></a>                                        </li>
                                                                                                            </ul>
                            </div>
                        </div>
                                    </li>
                            <li class="">
                    <a href="/news/entertainment_and_arts" class="">
                        <span>Entertainment &amp; Arts</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/video_and_audio/video" class="">
                        <span>Video &amp; Audio</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/magazine" class="">
                        <span>Magazine</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/in_pictures" class="">
                        <span>In Pictures</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/also_in_the_news" class="">
                        <span>Also in the News</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/special_reports" class="">
                        <span>Special Reports</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/explainers" class="">
                        <span>Explainers</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/the_reporters" class="">
                        <span>The Reporters</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/have_your_say" class="">
                        <span>Have Your Say</span>
                    </a>
                                                        </li>
                            <li class="">
                    <a href="/news/disability" class="">
                        <span>Disability</span>
                    </a>
                                                        </li>
                    </ul>
    </nav>
</div>
   

    <div id="comp-pattern-library-2" class="distinct-component-group ">
        
            <div id="bbc-news-services" class="blue-tit" role="navigation" aria-label="BBC News Services">
    <div class="blue-tit__inner">
        <h2 class="blue-tit__title">BBC News Services</h2>
        <ul class="blue-tit__list">
            <li class="blue-tit__list-item">
                <a href="http://www.bbc.co.uk/news/10628994" class="blue-tit__list-item-link mobile">On your mobile</a>
            </li>
            <li class="blue-tit__list-item">
                <a href="http://www.bbc.co.uk/news/help-17655000" class="blue-tit__list-item-link connected-tv">On your connected tv</a>
            </li>
            <li class="blue-tit__list-item">
                <a href="http://www.bbc.co.uk/news/10628323" class="blue-tit__list-item-link newsletter">Get news alerts</a>
            </li>
            <li class="blue-tit__list-item">
                <a href="http://www.bbc.co.uk/news/20039682" class="blue-tit__list-item-link contact-us">Contact BBC News</a>
            </li>
        </ul>
    </div>
</div>

        
    </div>

  </div><!-- closes #site-container -->      </div> <div id="orb-footer"  class="orb-footer orb-footer-grey b-footer--grey--white" >  <div id="navp-orb-footer-promo" class="orb-footer-grey"></div>  <aside role="complementary"> <div id="orb-aside" class="orb-nav-sec b-r b-g-p"> <div class="orb-footer-inner" role="navigation"> <h2 class="orb-footer-lead">Explore the BBC</h2> <div class="orb-footer-primary-links"> <ul>    <li  class="orb-nav-news orb-d"  > <a href="http://www.bbc.co.uk/news/">News</a> </li>    <li  class="orb-nav-newsdotcom orb-w"  > <a href="http://www.bbc.com/news/">News</a> </li>    <li  class="orb-nav-sport"  > <a href="/sport/">Sport</a> </li>    <li  class="orb-nav-weather"  > <a href="/weather/">Weather</a> </li>    <li  class="orb-nav-shop orb-w"  > <a href="http://shop.bbc.com/">Shop</a> </li>    <li  class="orb-nav-earthdotcom orb-w"  > <a href="http://www.bbc.com/earth/">Earth</a> </li>    <li  class="orb-nav-travel-dotcom orb-w"  > <a href="http://www.bbc.com/travel/">Travel</a> </li>    <li  class="orb-nav-capital orb-w"  > <a href="http://www.bbc.com/capital/">Capital</a> </li>    <li  class="orb-nav-iplayer orb-d"  > <a href="/iplayer/">iPlayer</a> </li>    <li  class="orb-nav-culture orb-w"  > <a href="http://www.bbc.com/culture/">Culture</a> </li>    <li  class="orb-nav-autos orb-w"  > <a href="http://www.bbc.com/autos/">Autos</a> </li>    <li  class="orb-nav-future orb-w"  > <a href="http://www.bbc.com/future/">Future</a> </li>    <li  class="orb-nav-tv"  > <a href="/tv/">TV</a> </li>    <li  class="orb-nav-radio"  > <a href="/radio/">Radio</a> </li>    <li  class="orb-nav-cbbc"  > <a href="/cbbc">CBBC</a> </li>    <li  class="orb-nav-cbeebies"  > <a href="/cbeebies">CBeebies</a> </li>    <li  class="orb-nav-food"  > <a href="/food/">Food</a> </li>    <li  > <a href="/iwonder">iWonder</a> </li>    <li  > <a href="/education">Bitesize</a> </li>    <li  class="orb-nav-travel orb-d"  > <a href="/travel/">Travel</a> </li>    <li  class="orb-nav-music"  > <a href="/music/">Music</a> </li>    <li  class="orb-nav-earth orb-d"  > <a href="http://www.bbc.com/earth/">Earth</a> </li>    <li  class="orb-nav-arts"  > <a href="/arts/">Arts</a> </li>    <li  class="orb-nav-makeitdigital"  > <a href="/makeitdigital">Make It Digital</a> </li>    <li  > <a href="/taster">Taster</a> </li>    <li  class="orb-nav-nature orb-w"  > <a href="/nature/">Nature</a> </li>    <li  class="orb-nav-local"  > <a href="/local/">Local</a> </li>    </ul> </div> </div> </div> </aside> <footer role="contentinfo"> <div id="orb-contentinfo" class="orb-nav-sec b-r b-g-p"> <div class="orb-footer-inner"> <ul>        <li  > <a href="/terms/">Terms of Use</a> </li>    <li  > <a href="/aboutthebbc/">About the BBC</a> </li>    <li  > <a href="/privacy/">Privacy Policy</a> </li>    <li  > <a href="/privacy/cookies/about">Cookies</a> </li>    <li  > <a href="/accessibility/">Accessibility Help</a> </li>    <li  > <a href="/guidance/">Parental Guidance</a> </li>    <li  > <a href="/contact/">Contact the BBC</a> </li>        <li  class=" orb-w"  > <a href="http://advertising.bbcworldwide.com/">Advertise with us</a> </li>    <li  class=" orb-w"  > <a href="/privacy/cookies/international/">Ad choices</a> </li>    </ul> <small> <span class="orb-hilight">Copyright &copy; 2016 BBC.</span> The BBC is not responsible for the content of external sites. <a href="/help/web/links/" class="orb-hilight">Read about our approach to external linking.</a> </small> </div> </div> </footer> </div>     <!-- BBCDOTCOM bodyLast --><div class="bbccom_display_none"><script type="text/javascript"> /*<![CDATA[*/ if (window.bbcdotcom && window.bbcdotcom.analytics) { bbcdotcom.analytics.page(); } /*]]>*/ </script><noscript><img src="http://b.scorecardresearch.com/p?c1=2&c2=18897612&ns_site=bbc-global-test&name=news.business-35530337" height="1" width="1" alt=""></noscript><script type="text/javascript"> /*<![CDATA[*/ if (window.bbcdotcom && bbcdotcom.currencyProviders) { bbcdotcom.currencyProviders.write(); } /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ if (window.bbcdotcom && bbcdotcom.currencyProviders) { bbcdotcom.currencyProviders.postWrite(); } /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ /** * ASNYC waits to make any gpt requests until the bottom of the page */ (function() { var gads = document.createElement('script'); gads.async = true; gads.type = 'text/javascript'; var useSSL = 'https:' == document.location.protocol; gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js'; var node = document.getElementsByTagName('script')[0]; node.parentNode.insertBefore(gads, node); })(); /*]]>*/ </script><script type="text/javascript"> /*<![CDATA[*/ if (window.bbcdotcom && bbcdotcom.data && bbcdotcom.data.stats && bbcdotcom.data.stats === 1 && bbcdotcom.utils && window.location.pathname === '/' && window.bbccookies && bbccookies.readPolicy('performance') ) { var wwhpEdition = bbcdotcom.utils.getMetaPropertyContent('wwhp-edition'); var _sf_async_config={}; /** CONFIGURATION START **/ _sf_async_config.uid = 50924; _sf_async_config.domain = "bbc.co.uk"; _sf_async_config.title = "Homepage"+(wwhpEdition !== '' ? ' - '+wwhpEdition : ''); _sf_async_config.sections = "Homepage"+(wwhpEdition !== '' ? ', Homepage - '+wwhpEdition : ''); _sf_async_config.region = wwhpEdition; _sf_async_config.path = "/"+(wwhpEdition !== '' ? '?'+wwhpEdition : ''); /** CONFIGURATION END **/ (function(){ function loadChartbeat() { window._sf_endpt=(new Date()).getTime(); var e = document.createElement("script"); e.setAttribute("language", "javascript"); e.setAttribute("type", "text/javascript"); e.setAttribute('src', '//static.chartbeat.com/js/chartbeat.js'); document.body.appendChild(e); } var oldonload = window.onload; window.onload = (typeof window.onload != "function") ? loadChartbeat : function() { oldonload(); loadChartbeat(); }; })(); } /*]]>*/ </script></div><!-- BBCDOTCOM all code in page -->  <script type="text/javascript"> document.write('<' + 'script id="orb-js-script" data-assetpath="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/" src="http://static.bbci.co.uk/frameworks/barlesque/3.7.3/orb/4/script/orb.min.js"><' + '/script>'); </script>  <script type="text/javascript"> (function() {
    'use strict';

    var promoManager = {
        url: '',
        promoLoaded: false,
                makeUrl: function (theme, site, win) {
            var loc = win? win.location : window.location,
                proto = loc.protocol,
                host = loc.host,
                url = proto + '//' + ((proto.match(/s:/i) && !host.match(/^www\.(int|test)\./i))? 'ssl.' : 'www.'),
                themes = ['light', 'dark'];

            if ( host.match(/^(?:www|ssl|m)\.(int|test|stage|live)\.bbc\./i) ) {
                url += RegExp.$1 + '.';
            }
            else if ( host.match(/^pal\.sandbox\./i) ) {
                url += 'test.';
            }

                        theme = themes[ +(theme === themes[0]) ];
           
           return url + 'bbc.co.uk/navpromo/card/' + site + '/' + theme;
        },
                init: function(node) {
            var disabledByCookie = (document.cookie.indexOf('ckns_orb_nopromo=1') > -1),
                that = this;
            
            if (window.promomanagerOverride) {
                for (var p in promomanagerOverride) {
                    that[p] = promomanagerOverride[p];
                }
            }
                
            if ( window.orb.fig('uk') && !disabledByCookie ) {
                require(['orb/async/_footerpromo', 'istats-1'], function(promo, istats) {

                    var virtualSite = istats.getSite() || 'default';
                    that.url = (window.promomanagerOverride || that).makeUrl('light', virtualSite);

                    if (that.url) { 
                        promo.load(that.url, node, {
                                                          onSuccess: function(e) {
                                if(e.status === 'success') {
                                    node.parentNode.className = node.parentNode.className + ' orb-footer-promo-loaded';
                                    promoManager.promoLoaded = true;
                                    promoManager.event('promo-loaded').fire(e);
                                }
                             },
                             onError: function() {
                                istats.log('error', 'orb-footer-promo-failed');
                                bbccookies.set('ckns_orb_nopromo=1; expires=' + new Date(new Date().getTime() + 1000 * 60 * 10).toGMTString() + ';path=/;');
                             }
                        });   
                    }
                });
            }
        }
    };
    
        
    define('orb/promomanager', ['orb/lib/_event'], function (event) {
        event.mixin(promoManager);
        return promoManager;
    });
    
    require(['orb/promomanager'], function (promoManager) {
        promoManager.init(document.getElementById('navp-orb-footer-promo'));
    })
})();
 </script>   
        <script type="text/javascript" src="//mybbc.files.bbci.co.uk/s/notification-ui/latest/js/notifications.js"></script>

    <script type="text/javascript">

        require.config({
            paths: {
                "mybbc/templates": '//mybbc.files.bbci.co.uk/s/notification-ui/latest/templates',
                "mybbc/notifications": '//mybbc.files.bbci.co.uk/s/notification-ui/latest/js'
            }
        });

        require(['mybbc/notifications/NotificationsMain', 'idcta/idcta-1'], function(NotificationsMain, idcta) {
            if (window.orb.fig.geo.isUK()) {
                NotificationsMain.run(idcta, '//mybbc.files.bbci.co.uk/s/notification-ui/latest/');
            }
        });
    </script>

 <script type="text/javascript"> if (typeof require !== 'undefined') { require(['istats-1'], function(istats){ istats.track('external', { region: document.getElementsByTagName('body')[0] }); istats.track('download', { region: document.getElementsByTagName('body')[0] }); }); } </script>                 <img alt="" id="livestats" src="http://stats.bbc.co.uk/o.gif?~RS~s~RS~News~RS~t~RS~HighWeb_Story~RS~i~RS~35530337~RS~p~RS~99104~RS~a~RS~Domestic~RS~u~RS~/news/business-35530337~RS~r~RS~0~RS~q~RS~0~RS~z~RS~4904~RS~">     <script> window.old_onload = window.onload; window.onload = function() { if(window.old_onload) { window.old_onload(); } window.loaded = true; }; </script> <!-- Chartbeat Web Analytics code - start -->
<script type="text/javascript">
    /** CONFIGURATION START **/
    _sf_async_config.sections = "News, News - business, News - STY, News - business - STY";
    <!-- if page is an index, add the edition to the path -->
    (function() {
        var noCookies = true;
        var cookiePrefix = '_chartbeat';
        if ("object" === typeof bbccookies && typeof bbccookies.readPolicy == 'function') {
            noCookies = !bbccookies.readPolicy().performance;
        }
        if (noCookies && document.cookie.indexOf(cookiePrefix) !== -1) {
            //Find and remove cookies whose names begin with '_chartbeat'
            var cookieSplit = document.cookie.split(';');
            var cookieLength = cookieSplit.length;
            while (cookieLength--) {
                var cookie = cookieSplit[cookieLength].replace(/^\s+|\s+$/g, '');
                var cookieName = cookie.split('=')[0];

                if (cookieName.indexOf(cookiePrefix) === 0) {
                    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
                }
            }
        }
        _sf_async_config.noCookies = noCookies;
    }());

    /** CONFIGURATION END **/
    (function(){
        function loadChartbeat() {
            window._sf_endpt=(new Date()).getTime();
            var e = document.createElement("script");
            e.setAttribute("language", "javascript");
            e.setAttribute("type", "text/javascript");
            e.setAttribute('src', '//static.chartbeat.com/js/chartbeat.js');
            document.body.appendChild(e);
        }
        var oldonload = window.onload;
        window.onload = (typeof window.onload != "function") ?
            loadChartbeat : function() { oldonload(); loadChartbeat(); };
    }());
</script>
<!-- Chartbeat Web Analytics code - end -->
 <!-- comscore mmx - start -->
<script>
	var _comscore = _comscore || [];
	_comscore.push({ c1: "2", c2: "17986528"});

	(function() {
		var s = document.createElement("script")
			, el = document.getElementsByTagName("script")[0];
		s.async = true;
		s.src = (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js";
		el.parentNode.insertBefore(s, el);
	})();
</script>

<noscript>
	<img src="http://b.scorecardresearch.com/p?c1=2&c2=17986528&cv=2.0&cj=1" alt="" class="image-hide" />
</noscript>
<!-- comscore mmx - end -->   <!-- mpulse start -->
<script>
(function(){

    window.bbcnewsperformance = {};
    var perf = window.performance;

    function firstScrollTimer() {
        document.removeEventListener('scroll', firstScrollTimer);

        perf.mark('firstScroll');
        perf.measure('scrolltime', 'firstScroll');
        var timing = perf.getEntriesByName('scrolltime');
        bbcnewsperformance.firstScrollTime = timing[0].startTime;
    }

    function primaryImageTimer(src) {
        var timing = perf.getEntriesByName(src);
        bbcnewsperformance.primaryImageTime = timing[0].responseEnd;
    }

    if (perf) {
        if (perf.mark && perf.measure) {
            document.addEventListener('scroll', firstScrollTimer);
        }

        if (perf.getEntriesByName) {
            var primaryImage = document.querySelector('.story-body__inner img');
            if (primaryImage) {
                var src = primaryImage.getAttribute('src');
                primaryImage.addEventListener('load', primaryImageTimer.bind(this, src));
            }
        }
    }

    var random = Math.random();
    var rate   = 1;
    if (rate && (random < rate)) {
        var accountId = "WDD4L-XTNMF-UDE8D-52W9K-N4FX8";

        // mpulse vendor code
        if(window.BOOMR && window.BOOMR.version){return;}
        var dom,doc,where,iframe = document.createElement('iframe');
        iframe.src = "javascript:false";
        iframe.title = ""; iframe.role="presentation";
        (iframe.frameElement || iframe).style.cssText = "width:0;height:0;border:0;display:none;";
        where = document.getElementsByTagName('script')[0];
        where.parentNode.insertBefore(iframe, where);

        try {
            doc = iframe.contentWindow.document;
        } catch(e) {
            dom = document.domain;
            iframe.src="javascript:var d=document.open();d.domain='"+dom+"';void(0);";
            doc = iframe.contentWindow.document;
        }
        doc.open()._l = function() {
            var js = this.createElement("script");
            if(dom) this.domain = dom;
            js.id = "boomr-if-as";
            js.src = '//c.go-mpulse.net/boomerang/' +
                accountId;
            BOOMR_lstart=new Date().getTime();
            this.body.appendChild(js);
        };
        doc.write('<body onload="document._l();">');
        doc.close();
        // mpulse vendor code - end
    }
})();
</script>
<!-- mpulse end -->
  </body> </html> 











`
