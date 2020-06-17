<?php
namespace go\modules\community\addressbook\controller;

use go\core\fs\Blob;
use go\core\jmap\EntityController;
use go\core\jmap\exception\InvalidArguments;
use go\modules\community\addressbook\model;

/**
 * The controller for the Contact entity
 *
 * @copyright (c) 2018, Intermesh BV http://www.intermesh.nl
 * @author Merijn Schering <mschering@intermesh.nl>
 * @license http://www.gnu.org/licenses/agpl-3.0.html AGPLv3
 */ 
class Contact extends EntityController {
	
	/**
	 * The class name of the entity this controller is for.
	 * 
	 * @return string
	 */
	protected function entityClass() {
		return model\Contact::class;
	}	
	
	
	
	protected function transformSort($sort) {
		$sort = parent::transformSort($sort);
		
		//merge sort on start to beginning of array
		return array_merge(['s.starred' => 'DESC'], $sort);
	}
	
	/**
	 * Handles the Foo entity's Foo/query command
	 * 
	 * @param array $params
	 * @see https://jmap.io/spec-core.html#/query
	 */
	public function query($params) {
		return $this->defaultQuery($params);
	}
	
	/**
	 * Handles the Foo entity's Foo/get command
	 * 
	 * @param array $params
	 * @see https://jmap.io/spec-core.html#/get
	 */
	public function get($params) {
		return $this->defaultGet($params);
	}
	
	/**
	 * Handles the Foo entity's Foo/set command
	 * 
	 * @see https://jmap.io/spec-core.html#/set
	 * @param array $params
	 */
	public function set($params) {
		return $this->defaultSet($params);
	}
	
	
	/**
	 * Handles the Foo entity's Foo/changes command
	 * 
	 * @param array $params
	 * @see https://jmap.io/spec-core.html#/changes
	 */
	public function changes($params) {
		return $this->defaultChanges($params);
	}
	
	public function export($params) {
		return $this->defaultExport($params);
	}
	
	public function import($params) {
		return $this->defaultImport($params);
	}
	
	public function importCSVMapping($params) {
		return $this->defaultImportCSVMapping($params);
	}

	public function merge($params) {
		return $this->defaultMerge($params);
	}

	public function labels($params) {

		$tpl = <<<EOT
{{contact.name}}
[assign address = contact.addresses | filter:type:"postal" | first]
[if !{{address}}]
[assign address = contact.addresses | first]
[/if]
{{address.formatted}}
EOT;

		$labels = new model\Labels($params['unit'] ?? 'mm', $params['pageFormat'] ?? 'A4');

		$labels->rows = $params['rows'] ?? 8;
		$labels->cols = $params['columns'] ?? 2;
		$labels->labelTopMargin = $params['labelTopMargin'] ?? 10;
		$labels->labelRightMargin = $params['labelRightMargin'] ?? 10;
		$labels->labelBottomMargin = $params['labelBottomMargin'] ?? 10;
		$labels->labelLeftMargin = $params['labelLeftMargin'] ?? 10;

		$labels->pageTopMargin = $params['pageTopMargin'] ?? 10;
		$labels->pageRightMargin = $params['pageRightMargin'] ?? 10;
		$labels->pageBottomMargin = $params['pageBottomMargin'] ?? 10;
		$labels->pageLeftMargin = $params['pageLeftMargin'] ?? 10;

		$labels->SetFont($params['font'] ?? 'dejavusans', '', $params['fontSize'] ?? 10);

		$tmpFile = $labels->render($params['ids'], $params['tpl'] ?? $tpl);

		$blob = Blob::fromFile($tmpFile);
		$blob->save();

		return ['blobId' => $blob->id];

	}
}

