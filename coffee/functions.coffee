## Internationalisation
__ = (msgname, placeholders) -> chrome.i18n.getMessage msgname, placeholders

## Functions (Fx)
Fx = 
	
	##
	openTab: (url, selected) ->
		selected ?= false
		chrome.tabs.create {"url": url, "selected": selected}
		return false
	
	## Concaténer plusieurs objets (notifications page)
	concat: ->
		ret = {}
		n = 0
		for i of arguments
			for own p of arguments[i]
				if n < 10
					ret[n] = arguments[i][p]
					n++
		return ret;
	
	##
	subFirst: (str, nbr) ->
		strLength = str.length
		strSub = str.substring 0, nbr
		strSub += '..' if strSub.length < strLength 
		return strSub
	
	##
	subLast: (str, nbr) ->
		strLength = str.length;
		strSub = str.substring strLength, Math.max 0, strLength-nbr
		strSub = '..' + strSub if strSub.length < strLength
		return strSub
	
	##
	cleanCache: ->
		login = DB.get('member').login;
		time = Math.floor new Date().getTime() / 1000
		persistentViews = [
			'planningMember.' + login
			'membersEpisodes.all'
			'timelineFriends'
			'membersNotifications'
			'membersInfos.' + login
		]
		
		views_updated = BD.get 'views_updated'
		for name, date of views_updated
			if not (name in persistentViews) and time - date >= 3600
				DB.remove 'update.' + suffix
				views_updated.splice date, 1
				
		views_to_refresh = DB.get 'views_to_refresh'
		for view, j of views_to_refresh
			if view in localStorage
				views_to_refresh.splice j, 1
		
					
	##
	updateHeight: (top) ->
		top ?= false
		setTimeout (
			-> 
				maxHeight = DB.get('options').max_height
				#h = $('#page').height() + 14
				#h = if h > maxHeight then maxHeight else h
				$('#about').height maxHeight
				params = if top then {scroll:'top'} else {}
				$('.nano').nanoScroller(params)
		), 500
		
	##
	toRefresh: (view) ->
		views_to_refresh = DB.get 'views_to_refresh'
		if not (view in views_to_refresh)
			views_to_refresh.push view
		DB.set 'views_to_refresh', views_to_refresh
		
	##
	getVersion: ->
		return chrome.app.getDetails().version
		
