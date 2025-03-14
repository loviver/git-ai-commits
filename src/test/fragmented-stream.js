const data = {
  "stream": {
      "a": 1,
      "b": [
          {
              "$mid": 21,
              "value": "```"
          },
          {
              "$mid": 21,
              "value": "json"
          },
          {
              "$mid": 21,
              "value": "\n"
          },
          {
              "$mid": 21,
              "value": "[\n"
          },
          {
              "$mid": 21,
              "value": "   "
          },
          {
              "$mid": 21,
              "value": " \""
          },
          {
              "$mid": 21,
              "value": "🔥"
          },
          {
              "$mid": 21,
              "value": " Remove"
          },
          {
              "$mid": 21,
              "value": " unused"
          },
          {
              "$mid": 21,
              "value": " text"
          },
          {
              "$mid": 21,
              "value": " plugin"
          },
          {
              "$mid": 21,
              "value": " from"
          },
          {
              "$mid": 21,
              "value": " es"
          },
          {
              "$mid": 21,
              "value": "build"
          },
          {
              "$mid": 21,
              "value": " configuration"
          },
          {
              "$mid": 21,
              "value": "\",\n"
          },
          {
              "$mid": 21,
              "value": "   "
          },
          {
              "$mid": 21,
              "value": " \""
          },
          {
              "$mid": 21,
              "value": "✨"
          },
          {
              "$mid": 21,
              "value": " Add"
          },
          {
              "$mid": 21,
              "value": " AI"
          },
          {
              "$mid": 21,
              "value": " provider"
          },
          {
              "$mid": 21,
              "value": " configuration"
          },
          {
              "$mid": 21,
              "value": " to"
          },
          {
              "$mid": 21,
              "value": " package"
          },
          {
              "$mid": 21,
              "value": ".json"
          },
          {
              "$mid": 21,
              "value": "\",\n"
          },
          {
              "$mid": 21,
              "value": "   "
          },
          {
              "$mid": 21,
              "value": " \""
          },
          {
              "$mid": 21,
              "value": "✨"
          },
          {
              "$mid": 21,
              "value": " Implement"
          },
          {
              "$mid": 21,
              "value": " Cop"
          },
          {
              "$mid": 21,
              "value": "ilot"
          },
          {
              "$mid": 21,
              "value": "AI"
          },
          {
              "$mid": 21,
              "value": " service"
          },
          {
              "$mid": 21,
              "value": " for"
          },
          {
              "$mid": 21,
              "value": " AI"
          },
          {
              "$mid": 21,
              "value": " interactions"
          },
          {
              "$mid": 21,
              "value": "\",\n"
          },
          {
              "$mid": 21,
              "value": "   "
          },
          {
              "$mid": 21,
              "value": " \""
          },
          {
              "$mid": 21,
              "value": "✨"
          },
          {
              "$mid": 21,
              "value": " Add"
          },
          {
              "$mid": 21,
              "value": " AI"
          },
          {
              "$mid": 21,
              "value": " agent"
          },
          {
              "$mid": 21,
              "value": " interface"
          },
          {
              "$mid": 21,
              "value": " definition"
          },
          {
              "$mid": 21,
              "value": "\",\n"
          },
          {
              "$mid": 21,
              "value": "   "
          },
          {
              "$mid": 21,
              "value": " \""
          },
          {
              "$mid": 21,
              "value": "♻"
          },
          {
              "$mid": 21,
              "value": "️"
          },
          {
              "$mid": 21,
              "value": " Ref"
          },
          {
              "$mid": 21,
              "value": "actor"
          },
          {
              "$mid": 21,
              "value": " commit"
          },
          {
              "$mid": 21,
              "value": " service"
          },
          {
              "$mid": 21,
              "value": " to"
          },
          {
              "$mid": 21,
              "value": " use"
          },
          {
              "$mid": 21,
              "value": " centralized"
          },
          {
              "$mid": 21,
              "value": " AI"
          },
          {
              "$mid": 21,
              "value": " agent"
          },
          {
              "$mid": 21,
              "value": " initialization"
          },
          {
              "$mid": 21,
              "value": "\"\n"
          },
          {
              "$mid": 21,
              "value": "]\n"
          },
          {
              "$mid": 21,
              "value": "```"
          }
      ],
      "d": null,
      "g": {
          "z": 0
      }
  },
  "text": {
      "a": 0,
      "b": [],
      "d": null,
      "g": {
          "z": 0
      }
  }
};

console.log(data);

const fragmentedStream = (stream) => {

	const findMids = Object.entries(stream).find(([key, value]) => {
		// console.log(value, typeof value, Array.isArray(value));

		return Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null);
	});

	let text = '';

	if(findMids) {
		const containMids = Object.values(findMids)[1];
		const mids = Object.values(containMids);

		for(const mid of mids) {
			text += mid.value;
		}
	}
	return text;
};

const response = fragmentedStream(data.stream);

console.log(response);