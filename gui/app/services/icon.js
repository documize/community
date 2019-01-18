// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import { A } from '@ember/array';
import Service from '@ember/service';

export default Service.extend({
	getSpaceIconList() {
		let cs = this.get('constants');

		let list = A([]);
		list.pushObject(cs.IconMeta.Star);
		list.pushObject(cs.IconMeta.Support);
		list.pushObject(cs.IconMeta.Message);
		list.pushObject(cs.IconMeta.Apps);
		list.pushObject(cs.IconMeta.Box);
		list.pushObject(cs.IconMeta.Gift);
		list.pushObject(cs.IconMeta.Design);
		list.pushObject(cs.IconMeta.Bulb);
		list.pushObject(cs.IconMeta.Metrics);
		list.pushObject(cs.IconMeta.PieChart);
		list.pushObject(cs.IconMeta.BarChart);
		list.pushObject(cs.IconMeta.Finance);
		list.pushObject(cs.IconMeta.Lab);
		list.pushObject(cs.IconMeta.Code);
		list.pushObject(cs.IconMeta.Help);
		list.pushObject(cs.IconMeta.Manuals);
		list.pushObject(cs.IconMeta.Flow);
		list.pushObject(cs.IconMeta.Out);
		list.pushObject(cs.IconMeta.In);
		list.pushObject(cs.IconMeta.Partner);
		list.pushObject(cs.IconMeta.Org);
		list.pushObject(cs.IconMeta.Home);
		list.pushObject(cs.IconMeta.Infinite);
		list.pushObject(cs.IconMeta.Todo);
		list.pushObject(cs.IconMeta.Procedure);
		list.pushObject(cs.IconMeta.Outgoing);
		list.pushObject(cs.IconMeta.Incoming);
		list.pushObject(cs.IconMeta.Travel);
		list.pushObject(cs.IconMeta.Winner);
		list.pushObject(cs.IconMeta.Roadmap);
		list.pushObject(cs.IconMeta.Money);
		list.pushObject(cs.IconMeta.Security);
		list.pushObject(cs.IconMeta.Tune);
		list.pushObject(cs.IconMeta.Guide);
		list.pushObject(cs.IconMeta.Smile);
		list.pushObject(cs.IconMeta.Rocket);
		list.pushObject(cs.IconMeta.Time);
		list.pushObject(cs.IconMeta.Cup);
		list.pushObject(cs.IconMeta.Marketing);
		list.pushObject(cs.IconMeta.Announce);
		list.pushObject(cs.IconMeta.Devops);
		list.pushObject(cs.IconMeta.World);
		list.pushObject(cs.IconMeta.Plan);
		list.pushObject(cs.IconMeta.Components);
		list.pushObject(cs.IconMeta.People);
		list.pushObject(cs.IconMeta.Checklist);

		return list;
	}
});
