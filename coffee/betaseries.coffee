menu = 
	show: -> $('.action').show()
	hide: -> $('.action').hide()
	hideStatus: -> $('#status').hide()
	hideMenu: -> $('#menu').hide()

BS = 
	
	#
	currentView: null
	
	# Lancer l'affichage d'une vue
	# BS.load 'membersEpisodes', 3, 'all'
	load: ->
		# réception des arguments
		args = Array.prototype.slice.call arguments
		
		# récupération des infos
		o = BS[arguments[0]].apply(args.shift(), args)
		
		# mémorisation des infos
		sameView = o.id is @currentView.id
		@currentView = o;
		
		# affichage de la vue (cache)
		BS.display()
		
		if o.update
			# heure actuelle à la seconde près
			time = Math.floor(new Date().getTime() / 1000)
			
			# conditions pour être mis à jour
			views_to_refresh = DB.get 'views_to_refresh'
			forceRefresh = o.id in views_to_refresh
			
			views_updated = DB.get 'views_updated'
			outdated = if views_updated[o.id]? then time - views_updated[o.id] > 3600 else true
			
			# on détermine si la vue va être mise à jour ou pas
			update = forceRefresh or outdated or sameView
			
			# on lance la requête de mise à jour ssi ça doit l'être
			BS.update() if update
		
	# Mettre à jour les données de la vue courante	
	update: ->
		o = @currentView
		
		# préparation des paramètres de la requête
		params = o.params || ''
		
		ajax.post o.url, params, 
			(data) ->
				r = o.root
				tab = data.root[r]
				
				# Opérations supp. sur les données reçues
				o.update(tab)
				
				# on met à jour la date de cette mise à jour
				views_updated = DB.get 'views_updated'
				time = Math.floor(new Date().getTime() / 1000)
				views_updated[o.id] = time
				DB.set 'views_updated', views_updated
					
				# Mise à jour du tableau des vues à recharger
				views_to_refresh = DB.get 'views_to_refresh'
				if o.id in views_to_refresh
					views_to_refresh.splice (views_to_refresh.indexOf o.id), 1
					DB.set 'views_to_refresh', views_to_refresh
		
	# Afficher la vue courante avec les données en cache		
	display: ->
		o = @currentView
		
		# on affiche la vue avec les données en cache
		$('#page').html o.content()
		
		# Titre et classe
		$('#title').text __(o.name)
		$('#page').removeClass().addClass o.name
			
		# Réglage de la hauteur du popup
		Fx.updateHeight true
		
	# Réactualise la vue courante
	refresh: ->
		args = @currentView.id.split '.'
		BS.load.apply(BS, args)
		
	size: ->
		return (JSON.stringify(localStorage).length /1000) + 'k'
	
	#
	showsDisplay: (url) ->
		id: "showsDisplay.#{url}"
		name: 'showsDisplay'
		url: "/shows/display/#{url}"
		root: 'show'
		content: (data) ->
			if data.banner?
				output = '<img src="' + data.banner + '" width="290" height="70" alt="banner" /><br />'
			output += '<div class="showtitle">' + data.title + '</div>'
			output += __('type')
			genres = []
			for k,v of data.genres
				genres.push v
			output += genres.join(', ') + '<br />'
			output += __('status') + __((data.status).toLowerCase()) + '<br />'
			output += __('avg_note') + data.note.mean + '/5 (' + data.note.members + ')'
			output += '<div style="height:54px; overflow:hidden">' + __('synopsis') + data.description + '</div>'
			
			output += '<div class="showtitle">' + __('seasons') + '</div>'
			for i of data.seasons
				season = data.seasons[i]
				output += __('season') + ' ' + season.number + ' '
				output += '<small>(' + season.episodes + ' ' + __('episodes') + ')</small><br />'
			
			output += '<div class="showtitle">' + __('actions') + '</div>'
			if data.is_in_account is '1'
				output += '<a href="#' + data.url + '" id="showsRemove">'
				output += '<img src="../img/film_delete.png" class="icon2" />' + __('show_remove') + '</a><br />'
			else
				output += '<a href="#' + data.url + '" id="showsAdd">'
				output += '<img src="../img/film_add.png" class="icon2" />' + __('show_add') + '</a><br />'
			output
		
	#
	showsEpisodes: (url, season, episode) ->
		id: "showsEpisodes.#{url}.#{season}.#{episode}"
		name: 'showsEpisodes'
		url: "/shows/episodes/#{url}"
		params: "&season=#{season}&episode=#{episode}"
		root: 'seasons'
		content: (data) ->
			episode = data['0']['episodes']['0']
			
			title = if DB.get 'options.display_global' then "##{episode.global} #{title}" else episode.title
			
			if episode.screen?
				output = '<img src="' + episode.screen + '" width="290" /><br />'
				
			# wrapper start
			output += "<div id=\"#{url}\" season=\"#{data['0']['number']}\" episode=\"#{episode.episode}\">"
			
			output += '<div class="showtitle">' + episode.show + '</div>'
			output += "<div><span class=\"num\">[#{episode.number}]</span> #{episode.title}</div>"
			output += '<div><span class="date">' + date('D d F', episode.date) + '</span></div>'
			output += '<div style="height:4px;"></div>'
			output += __('avg_note') + "#{episode.note.mean} (#{episode.note.members})<br />"
			output += '<div style="height:54px; overflow:hidden">' + __('synopsis') + episode.description + '</div>'
			
			output += '<div class="showtitle">' + __('subtitles') + '</div>'
			nbr_subs = 0
			for n of episode.subs
				sub = episode.subs[n]
				output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />'
				nbr_subs++
			output += __('no_subs') if nbr_subs is 0
			
			if episode.downloaded is '1'
				imgDownloaded = "folder"
				texte3 = __('mark_as_not_dl')
			else if episode.downloaded is '0'
				imgDownloaded = "folder_off"
				texte3 = __('mark_as_dl')
			
			output += '<div class="showtitle">' + __('actions') + '</div>'
			output += '<a href="" class="downloaded" onclick="return false;">'
			output += '<img src="../img/' + imgDownloaded + '.png" class="icon2" /><span class="dlText">' + texte3 + '</span></a><br />'
			output += '<a href="" class="commentList" onclick="return false;">'
			output += '<img src="../img/comment.png" class="icon2">' + __('see_comments', [episode.comments]) + '</a>'
			
			# wrapper end
			output += '</div>'
			
			return output
	
	#
	planningMember: (login) ->
		login ?= DB.get 'member.login'
		
		id: "planningMember.#{login}"
		name: 'planningMember'
		url: "/planning/member/#{login}"
		params: "&view=unseen"
		root: 'planning'
		content: (data) ->	
			output = ''
			week = 100
			MAX_WEEKS = 2
			nbrEpisodes = 0
			for e of data
				today = Math.floor new Date().getTime() / 1000
				todayWeek = parseFloat date('W', today)
				actualWeek = parseFloat date('W', data[e].date)
				diffWeek = actualWeek - todayWeek
				plot = if data[e].date < today then "orange" else "red"
				if actualWeek isnt week
					week = actualWeek
					hidden = ""
					if diffWeek < -1 
						w = __('weeks_ago', [Math.abs diffWeek])
					else if diffWeek is -1
						w = __('last_week')
					else if diffWeek is 0
						w = __('this_week')
					else if diffWeek is 1
						w = __('next_week')
					else if diffWeek > 1
						w = __('next_weeks', [diffWeek])
					if diffWeek < -2 or diffWeek > 2
						hidden = ' style="display:none"'
					if nbrEpisodes > 0
						output += '</div>'
					output += '<div class="week"' + hidden + '>'
					output += '<div class="showtitle">' + w + '</div>'
			
				output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + '">'
				
				output += '<div url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" class="left">'
				output += '<img src="../img/plot_' + plot + '.gif" /> '
				output += '<span class="show">' + data[e].show + '</span> '
				output += '<span class="num">[' + data[e].number + ']</span>'
				output += '</div>'
				
				output += '<div class="right">'
				output += '<span class="date">' + date('D d F', data[e].date) + '</span>'
				output += '</div>'
				
				output += '</div>'
				
				nbrEpisodes++
			return output
	
	#
	membersInfos: (login) ->
		login ?= DB.get 'member.login'
		myLogin = login is DB.get 'member.login'
		
		id: 'membersInfos.' + login
		name: 'membersInfos'
		url: '/members/infos/' + login
		root: 'member'
		content: (data) ->
			if data.avatar isnt ''
				avatar = new Image
				avatar.src = data.avatar
				avatar.onload = ->
					$('#avatar').attr 'src', data.avatar
			
			output = ''
			output += '<div class="showtitle">' + data.login + '</div>'
			output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />'
			output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>'
			
			if myLogin
				output += '<div style="height:11px;"></div>'
				output += '<div class="showtitle">' + __('archived_shows') + '</div>'
				for i of data.shows
					if data.shows[i].archive is "1"
						output += '<div class="episode" id="' + data.shows[i].url + '">'
						output += data.shows[i].title
						output += ' <img src="../img/unarchive.png" class="unarchive" title="' + __("unarchive") + '" />'
						output += '</div>'
			
			if data.is_in_account?
				output += '<div class="showtitle">' + __('actions') + '</div>'
				if data.is_in_account is 0
					output += '<div class="episode"><img src="../img/friend_add.png" id="friendshipimg" style="margin-bottom: -4px;" /> <a href="#" id="addfriend" login="' + data.login + '">' + __('add_to_friends', [data.login]) + '</a></div>'
				else if data.is_in_account is 1
					output += '<div class="episode"><img src="../img/friend_remove.png" id="friendshipimg" style="margin-bottom: -4px;"  /> <a href="#" id="removefriend" login="' + data.login + '">' + __('remove_to_friends', [data.login]) + '</a></div>'
			
			return output
	
	#
	membersEpisodes: (lang) ->
		lang ?= 'all'
		
		id: 'membersEpisodes.' + lang
		name: 'membersEpisodes',
		url: '/members/episodes/' + lang
		root: 'episodes'
		update: (data) ->
			stats = {}
			for d, e of data
				if e.url of stats
					stats[e.url]++
				else
					stats[e.url] = 1
				
			for d, e of data
				# cache des infos de la *série*
				shows = DB.get 'shows', {}
				if e.url of shows
					shows[e.url].archive = false
					show = null
				else
					shows[e.url] =
						url: e.url
						title: e.show
						archive: false
						hidden: false
						expanded: false
					# construction du bloc *série*
					show = Content.show shows[e.url], stats[e.url]
				DB.set 'shows', shows
				
				#cache des infos de *épisode*
				episodes = DB.get 'episodes.' + e.url, {}
				if e.global of episodes
					episodes[e.global].comments = e.comments
					episodes[e.global].downloaded = e.downloaded
					episode = null
				else
					episodes[e.global] =
						comments: e.comments
						date: e.date
						downloaded: e.downloaded
						episode: e.episode
						global: e.global
						number: e.number
						season: e.season
						title: e.title
						show: e.show
						seen: false
					#construction du bloc *épisode*
					episode = Content.episode episodes[e.global], shows[e.url], stats[e.url]++
				DB.set 'episodes.' + e.url, episodes
				
				# s'il y a un bloc *série* et un bloc *episode*
				if show? and episode?
					$('#shows').prepend '<div id="' + e.url + '" class="show"></div>'
					$('#' + e.url).append show + episode;
					
				# s'il y a un bloc *épisode* seulement
				else if episode?
					$('#' + e.url).append episode
				
				# TODO sinon on mets à jour le bloc *episode*
				#else
					
					
		content: ->
			# récupération des épisodes non vus (cache)
			data = {}
			for i, episodes of localStorage
				if i.indexOf('episodes.') is 0
					for j, episode of JSON.parse episodes
						continue if episode.seen
						es = if data[i.substring(9)]? then data[i.substring(9)] else []
						es.push(episode)
						data[i.substring(9)] = es
			
			# SHOWS
			output = '<div id="shows">'
			
			for i, es of data
				# récupération des infos sur la *série*
				s = DB.get('shows')[i]
				
				# SHOW
				output += '<div id="' + s.url + '" class="show">'
				
				# construction du bloc *série*
				output += Content.show s, es.length
				
				# construction des blocs *episode*
				for e, j in es
					output += Content.episode e, s, j
				
				output += '</div>'
			
			###	
			bgPage.badge.update()
			output += '<div id="noEpisodes">'
			output += __('no_episodes_to_see') 
			output += '<br /><br /><a href="#" onclick="BS.load(\'searchForm\').display(); return false;">'
			output += '<img src="../img/film_add.png" class="icon2" />' + __('add_a_show') + '</a>'
			output += '</div>'
			###
			
			output += '</div>'
			
			return output
	
	#
	membersNotifications: () ->
		id: 'membersNotifications'
		name: 'membersNotifications'
		url: '/members/notifications'
		root: 'notifications'
		postData: (tab1) ->
			res = tab1
			try
				temp = DB.get 'page.membersNotifications', null
				tab2 = if temp isnt null then JSON.parse temp else []
				res = Fx.concat tab1, tab2
			catch e
		    	console.log e
		    return res
		content: (data) ->
			output = ''
			nbrNotifications = 0
			
			time = ''
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += data[n].html
				output += '</div>'
				nbrNotifications++	
			
			bgPage.badge.update()
			output += __('no_notifications') if nbrNotifications is 0
			return output
	
	#
	commentsEpisode: (url, season, episode, show) ->
		id: 'commentsEpisode.' + url + '.' + season + '.' + episode
		name: 'commentsEpisode'
		url: '/comments/episode/' + url
		params: '&season=' + season + '&episode=' + episode
		root: 'comments'
		content: (data) ->
			i = 1
			time = ''
			output = '<div class="showtitle">' + show + '</div>';
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += '<b>' + date('H:i', data[n].date) + '</b> '
				output += '<span class="login">' + data[n].login + '</span> '
				output += '<small>#' + i + '</small><br />'
				output += data[n].text
				output += '</div>'
				i++
			
			output += __('no_comments') if i is 1
			return output
	
	#
	timelineFriends: ->
		id: 'timelineFriends'
		name: 'timelineFriends'
		url: '/timeline/friends'
		params: '&number=10'
		root: 'timeline'
		content: (data) ->
			output = ''
			time = ''
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += '<b>' + date('H:i', data[n].date) + '</b> '
				output += '<span class="login">' + data[n].login + '</span> ' + data[n].html
				output += '</div>'
			return output
	
	#
	connection: ->
		id: 'connection'
		name: 'connection'
		content: ->
			menu.hide()
			output = '<div style="height:10px;"></div>';
			output += '<form id="connect">'
			output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
			output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
			output += '</table>'
			output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou '
			output += '	<a href="#" onclick="BS.load(\'registration\'); return false;">' + __('sign_up') + '</a></div>'
			output += '</form>'
			return output
	
	#
	registration: ->
		id: 'registration'
		name: 'registration'
		content: ->
			menu.hide()
			output = '<div style="height:10px;"></div>';
			output += '<form id="register">'
			output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
			output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
			output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>'
			output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>'
			output += '</table>'
			output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou '
			output += '	<a href="#" onclick="BS.load(\'connection\'); return false;">' + __('sign_in') + '</a></div>'
			output += '</form>'
			return output
	
	#
	searchForm: ->
		id: 'searchForm'
		name: 'searchForm'
		content: ->
			output = '<div style="height:10px;"></div>';
			output += '<form id="search0">'
			output += '<input type="text" name="terms" id="terms" /> '
			output += '<input type="submit" value="chercher" />'
			output += '</form>'
			output += '<div id="shows-results"></div>'
			output += '<div id="members-results"></div>'
			setTimeout (() -> $('#terms').focus()), 100
			return output
	
	#
	blog: ->
		id: 'blog'
		name: 'blog'
		content: ->
			output = ''
			$.ajax
				type: 'GET'
				url: 'https://www.betaseries.com/blog/feed/'
				dataType: 'xml'
				async: false
				success: (data) ->
					items = $(data).find 'item'
					for i in [0..(Math.min 5, items.length)]
						item = $(items[i])
						
						titleOrig = item.find('title').text()
						title = titleOrig.substring 0, 40
						title += '..' if titleOrig.length > 40
						
						output += '<div class="showtitle">' + title
						#output += ' <span class="date">'+date('D d F', data[n].date)+'</span>';
						output += '</div>'
						
						desc = item.find('description').text()
						linkOrig = item.find('link').text()
						link = '<a href="#" onclick="Fx.openTab(\'' + linkOrig + '\');">(' + __('read_article') + ')</a>'
						output += '<div>' + desc.replace(/<a(.*)a>/, link) + '</div>'
						
						output += '<div style="height:11px;"></div>'
			
			return output
			
	#
	noConnection: ->
		id: 'noConnection'
		name: 'noConnection'
		content: ->
			output = __('be_connected') + '<br /><br /><a href="" onclick="BS.refresh(); return false;">'
			output += '<img src="../img/refresh.png" class="icon2" />' + __('refresh_view') + '</a>'
			return output
	