//
// Imports
//

import { Bindable } from "@donutteam/bindable";
import { APIResponse } from "@donutteam/custom-api-classes";
import { removeAllChildren } from "@donutteam/document-utilities";

//
// Exports
//

/**
 * A client class that submits form data to an API endpoint without reloading the page.
 */
export class AJAXForm extends Bindable
{
	/**
	 * The selector required for an element to be selected by bindAll.
	 * 
	 * @type {String}
	 */
	static selector = "form.ajax";

	/**
	 * The default credentials mode to use for underlying fetch requests.
	 * 
	 * Can be overriden with a "data-credentials-mode" property on the <form> element.
	 * 
	 * @type {"include"|"same-origin"|"omit"}
	 */
	static defaultCredentialsMode = "same-origin";

	/**
	 * The selector used on the form to find it's message list.
	 * 
	 * @type {String}
	 */
	static messageListSelector = "ul";

	/**
	 * The regex used to match success codes.
	 * 
	 * @type {RegExp}
	 */
	static successCodeRegExp = /SUCCESS_(.*)/;

	/**
	 * The CSS class applied to success messages.
	 * 
	 * @type {String}
	 */
	static successCSSClass = "success";

	/**
	 * The CSS class applied to error messages.
	 * 
	 * @type {String}
	 */
	static errorCSSClass = "error";

	/**
	 * Constructs a new AJAXForm.
	 * 
	 * @param {HTMLFormElement} form A <form> element.
	 * @author Loren Goodwin
	 */
	constructor(form)
	{
		super();

		this.form = form;

		this.messageList = this.form.querySelector(AJAXForm.messageListSelector);

		this.addEventListeners();
	}

	/**
	 * Adds the necessary event listeners for the AJAX form to function.
	 * 
	 * @author Loren Goodwin
	 */
	addEventListeners()
	{
		this.form.addEventListener("submit", async (event) =>
		{
			event.preventDefault();

			await this.fetch();
		});
	}

	/**
	 * Performs a request on this form.
	 * 
	 * @param {FormData} formData
	 * @returns {APIResponse}
	 * @author Loren Goodwin
	 */
	async fetch()
	{
		//
		// Create a FormData Object
		//

		const formData = new FormData(this.form);

		//
		// Fetch the Response (may fail and a default response is used instead)
		//

		let response;

		try
		{
			const rawResponse = await fetch(this.form.action,
				{
					credentials: this.form.dataset.credentialsMode ?? AJAXForm.defaultCredentialsMode,
					method: this.form.method,
					body: formData,
				});

			const parsedResponse = await rawResponse.json();

			response = new APIResponse(parsedResponse);
		}
		catch(error)
		{
			response = new APIResponse();

			response.addMessage(
				{ 
					code: "API_ERROR", 
					message: "Failed to contact the API endpoint used by this form. Please try again later.",
				});
		}

		//
		// Proceed to the Next Page (if the response says to)
		//

		if (response.success && response.info.next != null)
		{
			console.log("[AJAXForm] Proceeding to next page:", response.info.next);

			window.location = response.info.next;

			return;
		}

		//
		// Show Response Messages
		//

		if (this.messageList != null)
		{
			removeAllChildren(this.messageList);

			for (const message of response.messages)
			{
				const li = this.messageList.appendChild(document.createElement("li"));

				li.classList.add(AJAXForm.successCodeRegExp.test(message.code) ? AJAXForm.successCSSClass : AJAXForm.errorCSSClass);

				li.appendChild(document.createTextNode(`[${ message.code }] ${ message.message }`));
			}
		}
	}
}