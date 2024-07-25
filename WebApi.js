const WebApi = {
	//地面站-卫星的Access计算(考虑地面站的地形遮挡)
	"Site2Sate": {
		centralBodies: ["Moon"],
		//月球两极 地面站-卫星的Access计算(考虑地面站的地形遮挡)
		url: "{AeroSpaceUrl}/access/MoonPolarSite2Sate",
		isOnlyPolar: true,//是否只支持两极,默认为false
	},
	"AccessCompute": {
		//可见性报告对应的报告模板名称，用于通视分析里生成报告和统计图
		reportName: "可见性",
		//from-to 两个对象的Access计算
		//<br>对象类型: czmlPosition,site,Sgp4,TwoBody,CentralBody<br>输出参数中，如果from对象非地面物体，则方位角无意义，修正！
		url: "{AeroSpaceUrl}/access/AccessComputeV2",
	},
	//从数据库中获取所有符合查询条件的城市
	"city": {
		centralBodies: ["Earth"],
		//城市数据库
		url: "{AeroSpaceUrl}/city",
		urlDataField: "Cities",//数据集字段
	},

	//从数据库中获取所有符合查询条件的地面站
	"facility": {
		centralBodies: ["Earth"],
		url: "{AeroSpaceUrl}/facility",
		urlDataField: "Facilities",//数据集字段
	},

	//从数据库中获取所有符合查询条件的卫星ssc对象
	"ssc": {
		centralBodies: ["Earth"],
		url: "{AeroSpaceUrl}/ssc",
		urlDataField: "TLEs",//数据集字段
		sgp4: "{AeroSpaceUrl}/Propagator/sgp4",
	},

	//城市人口数据服务
	"population": {
		url: "resources/data/RK.json",
	},
	//基础姿态服务
	"BasicAttitude": {
		url: "{AeroSpaceUrl}",
		file: "WebApi/BasicAttitudeConfig.json",
	},
	//BBR System
	"BBRSystem": {
		url: "{AeroSpaceUrl}",
		file: "WebApi/BBRSystemConfig.json",
	},
	//火箭落区服务
	"LandingZone": {
		url: "{AeroSpaceUrl}/LandingZone",
	},
	//火箭轨道计算服务
	"SimpleAscent": {
		url: "{AeroSpaceUrl}/Propagator/SimpleAscent"
	},
	//导弹轨道计算服务
	"Ballistic": {
		url: "{AeroSpaceUrl}/Propagator/Ballistic"
	},
	//卫星HPOP轨道计算服务
	"HPOP": {
		url: "{AeroSpaceUrl}/Propagator/HPOP"
	},

	//卫星Astrogator轨道计算服务
	"Astrogator": {
		url: "{AeroSpaceUrl}/Astrogator/RunMCS"
	},
	"Gravity": {
		file: "WebApi/GravityFileConfig.json",
	},
	"VGT": {
		file: "WebApi/VGTConfig.json",
	},
	"DataProvider": {
		file: "WebApi/DataProviderConfig.json",
	},
	//越野路径分析（月球）
	"routing": {
		"url": "{RouteDesignUrl}/api/GetCostDis"
	},
	//碰撞分析
	"CloseApproach": {
		url: "{AeroSpaceUrl}/CAT/CA_ComputeV3",
		entityPositionCzmlUrl: "{AeroSpaceUrl}/CAT/CA_ComputeV4"
	},
	//光照分析
	"LightCompute": {
		url: "{AeroSpaceUrl}/Lighting/SiteLighting"
	},
	//方位角/仰角遮罩分析
	"AzElMask": {
		url: "{AeroSpaceUrl}/Terrain/AzElMaskSimple"
	},
	"DIS": {
		realTime: {
			url: "{RealTimeUrl}/receivemessagehub",
			defaultDataAdapter: "signalR"
		}
	},
	// "DIS": {
	// 	realTime: {
	// 		url: "{RealTimeUrl}/receiver",
	// 		defaultDataAdapter: "spaceData"
	// 	}
	// },
	"RGServer": {
		"LightingTimes": [
			{
				"type": "SC",
				"url": "{AeroSpaceUrl}/Lighting/LightingTimesSc",
				"availableForObjects": "LaunchVehicle,Missile,Satellite"
			},
			{
				"type": "Site",
				"url": "{AeroSpaceUrl}/Lighting/LightingTimesSite",
				"availableForObjects": "Facility,Place,Target"
			}
		],
		"SolarIntensity": [
			{
				"type": "Site",
				"url": "{AeroSpaceUrl}/Lighting/SolarIntensitySite",
				"availableForObjects": "Facility,Place,Target"
			},
			{
				"type": "SC",
				"url": "{AeroSpaceUrl}/Lighting/SolarIntensitySc",
				"availableForObjects": "LaunchVehicle,Missile,Satellite"
			}
		]
	},
	"ArcGISRestServer": {
		//"url":"https://services.arcgisonline.com/arcgis/rest/services"
		"url": "{ArcGISServerUrl}/arcgis/rest/services"
	},
	"TilesServer": {
		"url": "{LayerCongifJsonUrl}",
		"centralBodyNames": ['moon', 'mars'],
		"config": "/{centralBody}LayerConfig.json",
		"tilesUrl": "{TilesServerUrl}/type={WMTS_TypeId}&x={x}&y={y}&z={z}"
	},
	"Coverage": {
		"url": "{AeroSpaceUrl}/Coverage/GetGridPoints",
		"fomUrl": "{AeroSpaceUrl}/Coverage/ComputeCoverage"
	},
	staticData: {
		countries: [
			"AFGHANISTAN", "ALBANIA", "ALGERIA", "ANDORRA", "ANGOLA", "ANGUILLA", "ANTIGUA AND BARBUDA", "ARGENTINA", "ARMENIA", "ARUBA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BAHAMAS", "BAHRAIN", "BANGLADESH", "BARBADOS", "BELARUS", "BELGIUM", "BELIZE", "BENIN", "BERMUDA", "BHUTAN", "BOLIVIA", "BOSNIA_HERZEGOVINA", "BOTSWANA", "BRAZIL", "BRITISH INDIAN OCEAN", "BRITISH VIRGIN ISS", "BRUNEI", "BULGARIA", "BURKINA FASO", "BURMA", "BURUNDI", "CAMBODIA", "CAMEROON", "CANADA", "CAPE VERDE", "CAYMAN ISLANDS", "CENTRAL AFRICAN REP", "CHAD", "CHILE", "CHINA", "CHRISTMAS ISLAND", "COLOMBIA", "COMOROS", "CONGO", "COOK ISLANDS", "COSTA RICA", "COTE D'IVOIRE", "CROATIA", "CUBA", "CYPRUS", "CZECH REPUBLIC", "DEM REP OF CONGO", "DENMARK", "DJIBOUTI", "DOMINICA", "DOMINICAN REPUBLIC", "ECUADOR", "EGYPT", "EL SALVADOR", "EQUATORIAL GUINEA", "ERITREA", "ESTONIA", "ETHIOPIA", "FALKLAND ISS", "FAROE ISLANDS", "FIJI", "FINLAND", "FRANCE", "FRENCH GUIANA", "FRENCH POLYNESIA", "GABON", "GAMBIA", "GAZA STRIP", "GEORGIA", "GERMANY", "GHANA", "GIBRALTAR", "GREECE", "GREENLAND", "GRENADA", "GUADELOUPE", "GUATEMALA", "GUERNSEY", "GUINEA", "GUINEA-BISSAU", "GUYANA", "HAITI", "HONDURAS", "HONG KONG", "HUNGARY", "ICELAND", "INDIA", "INDONESIA", "IRAN", "IRAQ", "IRELAND", "ISLE OF MAN", "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "JERSEY", "JORDAN", "KAZAKHSTAN", "KENYA", "KIRIBATI", "KUWAIT", "KYRGYZSTAN", "LAOS", "LATVIA", "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LIECHTENSTEIN", "LITHUANIA", "LUXEMBOURG", "MACAU", "MACEDONIA", "MADAGASCAR", "MALAWI", "MALAYSIA", "MALDIVES", "MALI", "MALTA", "MARSHALL ISLANDS", "MARTINIQUE", "MAURITANIA", "MAURITIUS", "MAYOTTE", "MEXICO", "MICRONESIA", "MOLDOVA", "MONACO", "MONGOLIA", "MONTENEGRO", "MONTSERRAT", "MOROCCO", "MOZAMBIQUE", "NAMIBIA", "NEPAL", "NETHERLANDS", "NETHERLANDS ANTILLES", "NEW CALEDONIA", "NEW ZEALAND", "NICARAGUA", "NIGER", "NIGERIA", "NIUE", "NO MANS LAND", "NORTH KOREA", "NORWAY", "OMAN", "PAKISTAN", "PALAU", "PANAMA", "PAPUA NEW GUINEA", "PARAGUAY", "PERU", "PHILIPPINES", "PITCAIRN ISLANDS", "POLAND", "PORTUGAL", "QATAR", "REUNION", "ROMANIA", "RUSSIA", "RWANDA", "S.GEORGIA_SANDWICH", "SAN MARINO", "SAO TOME_PRINCIPE", "SAUDI ARABIA", "SENEGAL", "SERBIA", "SIERRA LEONE", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOLOMON ISLANDS", "SOMALIA", "SOUTH AFRICA", "SOUTH KOREA", "SPAIN", "SRI LANKA", "ST LUCIA", "ST. HELENA", "ST. KITTS AND NEVIS", "ST.PIERRE_MIQUELON", "STVINCENT_GRENADINES", "SUDAN", "SURINAME", "SVALBARD", "SWAZILAND", "SWEDEN", "SWITZERLAND", "SYRIA", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND", "TOGO", "TOKELAU", "TRINIDAD AND TOBAGO", "TIMOR-LESTE", "TUNISIA", "TURKEY", "TURKMENISTAN", "TURKS_CAICOS ISS", "TUVALU", "UGANDA", "UKRAINE", "UNITED ARAB EMIRATES", "UNITED KINGDOM", "URUGUAY", "USA", "UZBEKISTAN", "VANUATU", "VENEZUELA", "VIETNAM", "WEST BANK", "WESTERN SAHARA", "WESTERN SAMOA", "YEMEN", "ZAMBIA", "ZIMBABWE",
		],
		networks: [
			"Other", "21st Space", "30th Space", "45th Space", "50th Space", "AADC", "ACRES", "AFRL", "AFSCN", "All Mobile", "Arabsat", "ARR", "ASI", "Astrium", "ATT", "Blue Origin", "BMEWS", "British Tel.", "CCAFS", "CCRS", "CEE", "CEODE", "Cinedigm", "CLIRSEN", "CLTC", "CNES", "CNRSC", "CNSA", "Comcast", "CONAE", "CRC", "CRESDA", "CRISP", "CRL", "CSA", "CSIR", "CSIRO", "CSRSR", "CSTARS", "DARPA", "DataLynx", "DigitalGlobe", "DirecTV", "DISA", "DLR", "DRA", "DRDC", "ECHELON", "EchoStar", "e-GEOS", "EISCAT", "EPGN", "ESA", "ESRIN", "ESTRACK", "EUMETSAT", "EUSI", "EUTELSAT", "GEMS", "Geo Aust.", "GeoEye", "GISTDA", "Harris", "IAI", "IDSN", "ImageSat", "Inmarsat", "INPE", "INTA", "INTELSAT", "ISA", "ISAS", "ISRO", "ISTRAC", "ITU", "IVS", "JAXA", "JORN", "KARI", "KSAT", "LAPAN", "Lockheed M.", "MCI", "MDA", "NARSS", "NASA", "NASA DSN", "NASA MSFN", "NASA NEN", "NASA SN", "NASA STADAN", "NASA STDN", "NASDA", "NAVSOC", "NAVSPASUR", "NICT", "NOAA NESDIS", "NorthStar", "NRAO", "NRO", "NRSC", "NSAU", "NSF", "NSPO", "ONYX", "Orbcomm", "Other", "Pacific Sat", "Paradigm", "PFRR", "PMRF", "PrioraNet", "QinetiQ", "RCAEEI", "Reagan Test", "Reuters", "RFSA", "RSGS", "ScanEx", "SES", "SIME", "SingTel", "SKY Perfect", "Space Adv.", "SpaceX", "SPOT Image", "Sprint", "SSC", "SSN", "STFC", "SUPARCO", "Tata Comm.", "Telesat", "Tokai U.", "U. Tasmania", "USGS", "Vandenberg", "Verizon", "Virgin Gal.", "Wallops",
		],
		missions: [
			"Astronomy", "Comm", "Earth Sci", "Engineer", "Human Crew", "Life Sci", "Micro Grav", "Navigation", "Planet Sci", "Resupply", "Solar Phys", "Space Phys", "Space Sci", "Surv/Mil", "Tech App", "Unknown",
		],
		owners: [
			"AB", "ABS", "AC", "ALG", "ANG", "ARGN", "ASRA", "AUS", "AZER", "BEL", "BELA", "BGD", "BHUT", "BOL", "BRAZ", "BUL", "CA", "CHBZ", "CHLE", "CIS", "COL", "CRI", "CZCH", "DEN", "ECU", "EGYP", "ESA", "ESRO", "EST", "EUME", "EUTE", "FGER", "FIN", "FR", "FRIT", "GER", "GHA", "GLOB", "GREC", "GRSA", "GUAT", "HUN", "IM", "IND", "INDO", "IRAN", "IRAQ", "ISRA", "ISS", "IT", "ITSO", "JOR", "JPN", "KAZ", "KEN", "LAOS", "LKA", "LTU", "LUXE", "MA", "MALA", "MEX", "MMR", "MNG", "MUS", "NATO", "NETH", "NICO", "NIG", "NKOR", "NOR", "NPL", "NZ", "O3B", "ORB", "PAKI", "PERU", "POL", "POR", "PRC", "PRY", "RASC", "ROC", "ROM", "RP", "RWA", "SAFR", "SAUD", "SDN", "SEAL", "SES", "SGJP", "SING", "SKOR", "SPN", "STCT", "SVN", "SWED", "SWTZ", "TBD", "THAI", "TMMC", "TUN", "TURK", "UAE", "UK", "UKR", "URY", "US", "USBZ", "VENZ", "VTNM",
		],
	},

	spaceData: {
		hub: "{RealTimeUrl}/receiver",
		formulaUrl: "{RealTimeUrl}/formula/get",
		queryFormulaUrl: "{RealTimeUrl}/formula/query",
		saveUrl: "{RealTimeUrl}/formula/saveScene",
		czmlUrl: "{RealTimeUrl}/formula/czml",
		uploadFile: "/m/pluginFile/uploadFile",
		getFiles: "/m/pluginFile/getFiles",
	}
}
