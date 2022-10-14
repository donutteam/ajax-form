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
	static selector = `form.ajax, form[data-ajax="true"]`;

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
	 * The <form> element.
	 * 
	 * @type {HTMLFormElement}
	 */
	form;

	/**
	 * A list or list-like element within the <form>.
	 * 
	 * This MAY be null.
	 * 
	 * @type {HTMLElement}
	 */
	messageList;

	/**
	 * Constructs a new AJAXForm.
	 * 
	 * @param {HTMLFormElement} form A <form> element.
	 * @author Loren Goodwin
	 */
	constructor(form)
	{
		//
		// Call Super Constructor
		//

		super();

		//
		// Get Elements
		//

		this.form = form;

		this.messageList = this.form.querySelector(this.constructor.messageListSelector);

		//
		// Add Event Listeners
		//

		this.form.addEventListener("submit", async (event) =>
		{
			event.preventDefault();

			console.log("[AJAXForm] Handling form submission:", this.form);

			await this.submit();
		});
	}

	/**
	 * Performs a request on this form.
	 * 
	 * @param {FormData} formData
	 * @returns {APIResponse}
	 * @author Loren Goodwin
	 */
	async submit()
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
			let rawResponse;

			if (this.form.method == "get")
			{
				const searchParams = new URLSearchParams([ ...formData.entries() ]);

				rawResponse = await fetch(this.form.action + "?" + searchParams.toString(),
					{
						credentials: this.form.dataset.credentialsMode ?? this.constructor.defaultCredentialsMode,
						method: "GET",
					});
			}
			else if (this.form.method == "post")
			{
				rawResponse = await fetch(this.form.action,
					{
						credentials: this.form.dataset.credentialsMode ?? this.constructor.defaultCredentialsMode,
						method: "POST",
						body: formData,
					});
			}

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

			console.error("[AJAXForm] Fetch error:", error);
		}

		console.log("[AJAXForm] Response:", response); 

		//
		// Call After Function
		//

		const shouldContinue = await this.afterSubmit(response);

		if (!shouldContinue)
		{
			return;
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

				li.classList.add(this.constructor.successCodeRegExp.test(message.code) ? this.constructor.successCSSClass : this.constructor.errorCSSClass);

				li.appendChild(document.createTextNode(`[${ message.code }] ${ message.message }`));
			}
		}
	}

	/**
	 * A function called after submission with the response.
	 * 
	 * This is a stub in the base class.
	 * 
	 * @param {APIResponse} response
	 * @returns {Boolean} Whether or not the regular next page and message handling should get invoked.
	 * @author Loren Goodwin
	 */
	async afterSubmit(response)
	{
		return true;
	}
}