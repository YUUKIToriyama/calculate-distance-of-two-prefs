import axios from 'axios';
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import * as stringify from 'csv-stringify';
import * as fs from 'fs';

const endPoint = 'https://geolonia.github.io/japanese-prefectural-capitals/';

(async () => {
	type Prefs = Record<string, { lat: number, lng: number }>;
	const result: Prefs = await axios.get(endPoint).then(response => response.data);
	const prefectures = Object.entries(result);
	let resultSet: { from: string, to: string, distance: number }[] = [];
	while (prefectures.length > 1) {
		const prefA = prefectures.pop();
		const from = point([prefA![1].lng, prefA![1].lat]);
		prefectures.forEach(prefB => {
			const to = point([prefB[1].lng, prefB[1].lat]);
			const result = distance(from, to);
			resultSet.push({
				from: prefA![0],
				to: prefB[0],
				distance: result
			});
		})
	}
	resultSet.sort((a, b) => {
		if (a.distance > b.distance) {
			return 1
		} else if (a.distance < b.distance) {
			return -1
		} else {
			return 0
		}
	});
	stringify(resultSet, {
		header: true,
		columns: ["from", "to", "distance"]
	}, (error, data) => {
		fs.writeFile("result.csv", data, err => {
			if (err) {
				throw err;
			} else {
				console.log("Finished");
			}
		})
	})
})();
