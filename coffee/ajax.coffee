##
 # Classe Ajax
 #
bgPage = chrome.extension.getBackgroundPage()

ajax =
	
	url_api: "https://api.betaseries.com",	# Url API
	site_url: "https://www.betaseries.com",	# Url site
	key: "6db16a6ffab9",					# Developer key
	
	## Envoie des données en POST vers un des WS de BetaSeries
	post: (category, params, successCallback, errorCallback) ->
		params ?= ''
		member = DB.get 'session', {}
		token = if member.token is null then '' else "&token=" + member.token
		useragent = "chromeseries-" + Fx.getVersion()
		$('#sync img').attr 'src', '../img/sync.gif'
		$.ajax
			type: "POST"
			url: @url_api + category + ".json"
			data: "user-agent=" + useragent + "&key=" + @key + params + token
			dataType: "json"
			success: (data) ->
				#console.log data
				$('#sync img').attr 'src', '../img/sync.png'
				successCallback data if successCallback?
			error: ->
				$('#sync img').attr 'src', '../img/sync.png'
				errorCallback() if errorCallback?
