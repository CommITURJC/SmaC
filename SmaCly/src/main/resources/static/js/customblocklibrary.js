Blockly.Blocks['file'] = {
  init: function() {
    this.appendValueInput("version_file")
        .setCheck(["version","range_version"])
        .appendField("Name File")
        .appendField(new Blockly.FieldTextInput("Insert here file's name"), "name");
    this.appendStatementInput("elements_file")
        .setCheck(["import","abstract_contract","contract","library","interface"]);
    this.setColour(120);
    this.setTooltip("This blocks represents a smart contract file himself. This is the first element of the blocks model contract (Require define a compiler version). This element requires a version element or experimental version. Inside it, you should include the block contract or abstract contract to define a smart contract  (smart contract class). Optionally, you can define or import resources to extend the funcionality");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/structure-of-a-contract.html");
  },
};

Blockly.Blocks['version'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("version")
        .appendField(new Blockly.FieldDropdown([[">","greater"], [">=","greater_equal"]]), "symbolversion")
        .appendField(new Blockly.FieldNumber(0, 0, 0), "value1version")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 9), "value2version")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 25), "value3version");
    this.setOutput(true, "version");
    this.setColour(120);
 this.setTooltip("This element represents the compiler order 'pragma solidity'. The compiler transform the smart contract code to bytecode for deploy in a blockchain network. You must insert this element expression in the file element block");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/layout-of-source-files.html#version-pragma");
  }
};


Blockly.Blocks['version_experimental'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("pragma experimental")
        .appendField(new Blockly.FieldDropdown([[">","greater"], [">=","greater_equal"]]), "symbolversion")
        .appendField(new Blockly.FieldNumber(0, 0, 0), "value1version")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 9), "value2version")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 25), "value3version")
        .appendField(new Blockly.FieldDropdown([["<=","less_equal"], ["<","less"], [">","greater"], [">=","greater_equal"]]), "symbolcomparation")
        .appendField(new Blockly.FieldNumber(0, 0, 0), "value1versionoptional")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 9), "value2versionoptional")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 25), "value3versionoptional");
    this.setOutput(true, "version_experimental");//Returned type or list of returned types. Null or undefined if any type could be returned (e.g. variable get).
    this.setColour(120);
 this.setTooltip("This element represents the compiler order 'pragma experimental' it can be used to enable features of the compiler or language that are not yet enabled by default..You must insert this element in the file element");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/layout-of-source-files.html#experimental-pragma");
  }
};

Blockly.Blocks['interface'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("interface")
        .appendField(new Blockly.FieldTextInput("Insert here interface's name"), "name");
    this.appendValueInput("nameinterfacefather")
        .setCheck(["interface_father"])
        .appendField("Inheritance?");
    this.appendStatementInput("interface_functions")
        .setCheck(["interface_clausedeclaration","event"]);
    this.setPreviousStatement(true, ["file","library"]);
    this.setNextStatement(true,["contract","interface"]);
    this.setColour(230);
 this.setTooltip("Interface element contains the function's head to be implemented in the smart contract. Inside this element, you should only include events or the head of the smart contract's functions. You should define the complete functions inside the smart contract's body (Inside contract class)");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#interfaces");
  }
};

Blockly.Blocks['interface_father'] = {
  init: function() {
    this.appendValueInput("interfaces_inherit")
        .setCheck(['interface_father'])
        .appendField(new Blockly.FieldTextInput("Interface's name inherit"), "name");
    this.setInputsInline(false);
    this.setOutput(true, 'interface_father');
    this.setColour(230);
 this.setTooltip("This block represents the name of the interface on which its functionality is inherited.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['interface_clausedeclaration'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("function")
        .appendField(new Blockly.FieldTextInput("Insert here function's name"), "name");
    this.appendValueInput("inputparams_function")
        .setCheck("inputparam")
        .appendField("Input params?");
    this.appendValueInput("modifiers")
        .setCheck(null)
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["external","external"]]), "values_visibility")
        .appendField("state")
        .appendField(new Blockly.FieldDropdown([["none",""],["view","view"], ["pure","pure"], ["payable","payable"]]), "values_inputmodifier")
        .appendField("Modifiers?");
    this.appendValueInput(["returns_values"])
        .setCheck(["outputparam","tuple"])
        .appendField("returns values?");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["interface_clausedeclaration","event"]);
    this.setNextStatement(true, ["interface_clausedeclaration"]);
    this.setColour(15);
 this.setTooltip("Define the function's head to be implemented in the smart contract. This element only can be include in the interface element");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#interfaces");
  }
};


Blockly.Blocks['import'] = {
  init: function() {
    this.appendValueInput("alias")
        .setCheck("alias_import")
        .appendField("import")
        .appendField(new Blockly.FieldTextInput("Insert here the resource's route"), "resource_route");
    this.setInputsInline(false);
    this.setPreviousStatement(true, ["file","import"]);
    this.setNextStatement(true,  ["import","library","interface","contract"]);
    this.setColour(230);
 this.setTooltip("This element indicates smart contract's external resources to be used in a smart contract, taking advantage of the functionality defined in the library. You should indicate the external resource's route");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/layout-of-source-files.html#importing-other-source-files");
  }
};

Blockly.Blocks['alias_import'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("import's alias")
        .appendField(new Blockly.FieldTextInput("default"), "alias");
    this.setOutput(true,"alias_import");
    this.setColour(230);
 this.setTooltip("Define a personalized 'alias' for naming the import. You must define an import element before to connect this alias");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/layout-of-source-files.html#importing-other-source-files");
  }
}


;Blockly.Blocks['library'] = {
  init: function() {
    this.appendStatementInput("functions_library")
        .setCheck(["clause"])
        .appendField("library")
        .appendField(new Blockly.FieldTextInput("Insert here library's name"), "name");
    this.setPreviousStatement(true, ["file","library","import"]);
    this.setNextStatement(true, ["library","interface","contract"]);
    this.setColour(195);
 this.setTooltip("This element contains smart contract's functions, structs or properties to be used in a smart contract, taking advantage of the functionality defined in the library");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#libraries");
  }
};

Blockly.Blocks['modifier'] = {
  init: function() {
    this.appendValueInput("inputparams")
        .setCheck("inputparam")
        .appendField("modifier")
        .appendField(new Blockly.FieldTextInput("Insert here modifier's name"), "name")
        .appendField("Input params?");
    this.appendStatementInput("restrictions_modifier")
        .setCheck(["restriction_clause","restriction_clausecomment","personalized_expression","assign_value_expression","markmodifier","closemodifier"]);
    this.setPreviousStatement(true, ["contract_constructor","modifier","event"]);
    this.setNextStatement(true, ["modifier","event","clause"]); 
    this.setColour(165);
 this.setTooltip("This element represents a smart contract's modifier which are used to change or restrict the behavior of a function in a smart contract in Solidity language. You can use a modifier to automatically check a condition prior to executing the function. Contract's modifier must be include inside the contract element, must be defined before the definition of the events and functions of a smart contract. Modifier element contains restrictions,expressions and conditional logic expressions. The Modifier element may or may not receive input parameters.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#function-modifiers");
  }
};


Blockly.Blocks['block_inputmodifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("input modifier")
        .appendField(new Blockly.FieldTextInput("modifier"), "value");
    this.appendValueInput("inputparams")
        .setCheck(["inputparam"])
        .appendField("params?");
    this.appendValueInput("modifier")
        .setCheck(["block_inputmodifier"])
        .appendField("next");
    this.setInputsInline(false);
    this.setOutput(true, ["block_inputmodifier"]);
    this.setColour(165);
    this.setTooltip("This element represents the function's modifier. If you insert a modifier, you can change or restrict the behavior of a function in a smart contract in Solidity language. You must insert this element in the function's head element");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#function-modifiers");
  }
};

Blockly.Blocks['restriction_clause'] = {
  init: function() {
    this.appendValueInput("condition")
        .setCheck(["comparation_logicalexpression","comparation_arithmeticalexpression","comparation_expression","parenthesis_expression","personalized_inputexpression","block_negation"])
        .appendField("require");
    this.setInputsInline(true);
    this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(45);
 this.setTooltip("This element represents a require element in Solidity. In Solidity language,this expression is used to define a requirement that must be met for the execution of the code, otherwise an exception is produced and it is not executed. You must insert this element inside Smart contract's contructor, modifier or functions.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html#panic-via-assert-and-error-via-require");
  }
};

Blockly.Blocks['restriction_clausecomment'] = {
  init: function() {
    this.appendValueInput("condition")
        .setCheck(["comparation_logicalexpression","comparation_arithmeticalexpression","comparation_expression","parenthesis_expression","personalized_inputexpression","block_negation"])
        .appendField("require");
    this.appendDummyInput()
        .appendField("comment")
        .appendField(new Blockly.FieldTextInput("Insert here your comment"), "comment");
     this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(45);
 this.setTooltip("This element represents a require element in Solidity. In Solidity language, this expression is used to define a requirement that must be met for the execution of the code, otherwise an exception is produced and it is not executed. You must insert this element inside Smart contract's contructor, modifier or functions.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html#panic-via-assert-and-error-via-require");
  }
};

Blockly.Blocks['closemodifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("_;");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(165);
 this.setTooltip("The _; symbol within a modifier has a very specific purpose: it indicates where the code of the function being modified is to be executed.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['markmodifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("_;");
    this.setInputsInline(true);
    this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(165);
 this.setTooltip("The _; symbol within a modifier has a very specific purpose: it indicates where the code of the function being modified is to be executed.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['event'] = {
  init: function() {
    this.appendValueInput("inputparams")
        .setCheck("inputparam")
        .appendField("event")
        .appendField(new Blockly.FieldTextInput("Insert here event's name"), "name")
        .appendField("Input params?");
    this.setInputsInline(false);
    this.setPreviousStatement(true,["contract_constructor","modifier","event"]);//Incapacita que se pueda meter dentro de contratos
    this.setNextStatement(true, ["event","clause","interface_clausedeclaration"]);
    this.setColour(60);
 this.setTooltip("This element is a Smart contract's event. Contract's event must be include inside the contract element. The event element may or may not receive input parameters");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#events");
  }
};

Blockly.Blocks['error_definition'] = {
  init: function() {
    this.appendValueInput("inputparams")
        .setCheck("inputparam")
        .appendField("error")
        .appendField(new Blockly.FieldTextInput("Insert here error's name"),"name")
        .appendField("Input params?");
    this.setPreviousStatement(true, ["event","error_definition","contract_constructor","modifier","clause" ]);
    this.setNextStatement(true, ["event","error_definition","clause","contract_constructor"]);
    this.setColour(0);
    this.setTooltip("Defines a custom Solidity error.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['emit_event'] = {
  init: function() {
    this.appendValueInput("inputparams")
        .setCheck("inputparam")
        .appendField("emit")
        .appendField(new Blockly.FieldTextInput("Insert here event's name to emit"), "name")
        .appendField("Input params?");
    this.setPreviousStatement(true,["emit_event","assign_value_expression","personalized_expression","block_assembly","abyencode_function","deleteexpression","revert_expression","assert_function","sha_function","restriction_clausecomment","restriction_clause"]);
    this.setNextStatement(true,["emit_event","assign_value_expression","personalized_expression","block_assembly","abyencode_function","deleteexpression","revert_expression","assert_function","sha_function","restriction_clausecomment","restriction_clause"]);
    this.setColour(60);
 this.setTooltip("This element represents the trigger expression of the event inside the function. Emit event expression only can be insert inside the function element. The emit event expression may or may not receive input parameters ");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/structure-of-a-contract.html#events");
  }
};




Blockly.Blocks['inputparam'] = {
  init: function() {
    this.appendStatementInput("inputparams")
        .setCheck(["input_param","inputparamshortidentifier"])
        .appendField("input params");
    this.setOutput(true, "inputparam");
    this.setColour(285);
 this.setTooltip("The data it receives as input to be used in the element (Modifier, Event, Function).");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['inputparamshortidentifier'] = {
  init: function() {
    this.appendValueInput("type")
        .setCheck(["type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_text","type_mapping","type_User","type_Company"])
        .appendField("input param")
        .appendField("type");
    this.appendValueInput("arraydimension")
        .setCheck(["arraydimension","dynamic_array"])
        .appendField("array?");
    this.appendDummyInput()
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("Insert here the identifier's name"), "name");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(285);
 this.setTooltip("The data it receives as input to be used in the element.This block is a shorthand representation of an identifier input parameter.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['input_param'] = {
  init: function() {
    this.appendValueInput("type")
        .setCheck(["type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_text","type_mapping","type_User","type_Company"])
        .appendField("type");
    this.appendValueInput("arraydimension")
        .setCheck(["arraydimension","dynamic_array"])
        .appendField("array dimension?");
    this.appendDummyInput()
        .appendField("storagedata?")
        .appendField(new Blockly.FieldDropdown([["memory","memory"], ["storage","storage"],["calldata","calldata"]]), "storagedata_values")
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("Insert here param's name"), "name");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(285);
 this.setTooltip("The data it receives as input to be used in the element (Modifier, Event, Function).");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['outputparam'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("outputparam");
    this.appendValueInput("value_type_outputparam")
        .setCheck([ "type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_text","type_mapping","type_User","type_Company"])
        .appendField("type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendDummyInput()
        .appendField("storage?")
        .appendField(new Blockly.FieldDropdown([["none",""],["memory","memory"],["storage","storage"],["calldata","calldata"]]), "storagedata_values")
        .appendField("name")
        .appendField(new Blockly.FieldTextInput("Insert here the name of the output param"),"name");
    this.setInputsInline(true);
    this.setOutput(true,null);
    this.setColour(230);
    this.setTooltip("The data type or value that the function returns.");
    this.setHelpUrl("");
  }
};



Blockly.Blocks['contract'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("contract")
        .appendField(new Blockly.FieldTextInput("Insert here contract's name"), "name");
    this.appendValueInput("namecontractfather")
        .setCheck(["contract_father"])
        .appendField("Inheritance?");
    this.appendStatementInput("contract_elements")
        .setCheck(["receive_function","fallback_function","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","event","error_definition","modifier","clause"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["file","interface","library","import","abstract_contract","contract"]);
    this.setNextStatement(true,["contract"]);
    this.setColour(345);
 this.setTooltip("This element represents a smart contract, who simulates a traditional contract. Contract element contains properties,modifiers,events or functions");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#creating-contracts");
  }
};

Blockly.Blocks['abstract_contract'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("abstract contract")
        .appendField(new Blockly.FieldTextInput("Insert here contract's name"), "name");
    this.appendValueInput("namecontractfather")
        .setCheck(["contract_father"])
        .appendField("Inheritance?");
    this.appendStatementInput("contract_elements")
        .setCheck(["abstract_clausedeclaration","event","modifier","clause","contract_constructor","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property","number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty", "boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true,["file","interface","library","import","abstract_contract"]);
    this.setNextStatement(true, ["abstract_contract","contract"]);
    this.setColour(345);
 this.setTooltip("This element represents an abstract smart contract, who simulates an abstract class in Java. In this element, the logic to be executed by the smart contract is defined based on a series of conditions defined by the user. Abstract contract element contains properties,modifiers,events or functions");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#abstract-contracts");
  }
};

Blockly.Blocks['abstract_clausedeclaration'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("function")
        .appendField(new Blockly.FieldTextInput("Insert here function's name"), "name");
    this.appendValueInput("inputparams_function")
        .setCheck("inputparam")
        .appendField("Input params?");
    this.appendValueInput("virtual")
        .setCheck(null)
        .appendField("virtual")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "virtual");
    this.appendValueInput("modifiers")
        .setCheck(["block_inputmodifier","overridemodifier"])
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("state")
        .appendField(new Blockly.FieldDropdown([["none",""],["view","view"], ["pure","pure"], ["payable","payable"]]), "values_inputmodifier")
        .appendField("Modifiers?");
    this.appendValueInput("returns_values")
        .setCheck(["outputparam","type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_Company","type_User","type_text","type_mapping","tuple"])
        .appendField("returns values?");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["abstract_clausedeclaration", "event"]);
    this.setNextStatement(true, ["abstract_clausedeclaration", "event"]);
    this.setColour(15);
 this.setTooltip("");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#abstract-contracts");
  }
};


Blockly.Blocks['contract_father'] = {
  init: function() {
    this.appendValueInput("contracts_inherit")
        .setCheck(['contract_father'])
        .appendField(new Blockly.FieldTextInput("Contract's name inherit"), "name");
    this.setInputsInline(false);
    this.setOutput(true, 'contract_father');
    this.setColour(345);
 this.setTooltip("This block represents the name of the contract on which its functionality is inherited.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['interface_father'] = {
  init: function() {
    this.appendValueInput("interface_inherit")
        .setCheck(['interface_father'])
        .appendField(new Blockly.FieldTextInput("Interface's name inherit"), "name");
    this.setInputsInline(false);
    this.setOutput(true, "interface_father");
    this.setColour(230);
 this.setTooltip("This block represents the name of the interface on which its functionality is inherited.");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['contract_constructor'] = {
  init: function() {
    this.appendValueInput("type")
        .setCheck("inputparam")
        .appendField("constructor")
        .appendField("input params?");
    this.appendValueInput("inherance")
        .setCheck('block_constructor_contract_inherance')
        .appendField("inherance?");
    this.appendDummyInput()
        .appendField("payable?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "payable");
    this.appendStatementInput("expressions_constructor")
        .setCheck(["restriction_clause","restriction_clausecomment","personalized_expression","assign_value_expression","block_try"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true,["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true, ["contract_constructor","event","modifier","clause"]);
    this.setColour(320);
    this.setTooltip("This element is a Smart contract's constructor, where the variables/properties of the smart contract are initialized. Contract's constructor must be include inside the contract element. If you don't define a constructor, by default, the empty constructor is used");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#constructor");
  }
};

Blockly.Blocks['block_constructor_contract_inherance'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Contract's name inherance")
        .appendField(new Blockly.FieldTextInput("default"), "contract_name_inherance");
    this.appendValueInput("input_params")
        .setCheck("inputparam")
        .appendField("Input params?");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(320);
 this.setTooltip("This is a call to the constructor of the parent contract from which this contract inherits. The input parameters must correspond to those defined in the constructor of the contract from which it inherits (parent).");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#constructor");
  }
};


var arrayExpressions = ["shift_expression","assing_value_expression","bracket_expression","revert_expression",
"bitwise_expression","selfdestruct_function","personalized_casting_expression","abyencodepacked"];



Blockly.Blocks['clause'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("function")
        .appendField(new Blockly.FieldTextInput("Insert here function's name"), "name");
    this.appendValueInput("inputparams_function")
        .setCheck("inputparam")
        .appendField("Input params?");
    this.appendValueInput("modifiers")
        .setCheck(["block_inputmodifier","overridemodifier"])
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("state")
        .appendField(new Blockly.FieldDropdown([["none",""],["view","view"], ["pure","pure"], ["payable","payable"]]), "values_inputmodifier")
        .appendField("Modifiers?");
    this.appendValueInput("returns_values")
        .setCheck(["outputparam","type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_Company","type_User","type_text","type_mapping","tuple"])
        .appendField("returns values?");
    this.appendStatementInput("elements_function")
        .setCheck(["block_unchecked","restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_whileloop","block_dowhile","block_for","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","event","clause"]);
    this.setNextStatement(true, ["clause"]);
    this.setColour(15);
    this.setTooltip("This element is a Smart contract's function. Contract's clause must be include inside the contract element. If the function sends currencies inside it, you must include the 'payable'");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#functions");
  }
};
  
Blockly.Blocks['receive_function'] = {
  init: function() {
    var payableField = new Blockly.FieldCheckbox("TRUE", function(value) { //ASÍ SIEMPRE ES TRUE AUNQUE DESMARQUE EL USUARIO
       return "TRUE";
    });
    this.appendDummyInput()
        .appendField("receive")
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["external","external"]]), "values_visibility")
        .appendField("payable")
        .appendField(payableField, "payable")
        .appendField("virtual")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "virtual");
    this.appendStatementInput("elements_function")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_whileloop","block_dowhile","block_for","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_try"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","event","modifier","clause","receive_function","fallback_function"]);
    this.setNextStatement(true, ["clause","receive_function","fallback_function"]);
    this.setColour(15);
    this.setTooltip("Receive function. It is executed when the contract receives Ether without calldata.");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#receive-ether-function");
  }
};

Blockly.Blocks['fallback_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("fallback")
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["external","external"]]), "values_visibility")
        .appendField("payable")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "payable")
        .appendField("virtual")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "virtual");

    this.appendStatementInput("elements_function")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_whileloop","block_dowhile","block_for","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_try"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","event","modifier","clause","receive_function","fallback_function"]);
    this.setNextStatement(true, ["clause","receive_function","fallback_function"]);
    this.setColour(15);
    this.setTooltip("Fallback function. It is executed when no other function matches the calldata.");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#fallback-function");
  }
};

Blockly.Blocks['overridemodifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("override");
    this.appendValueInput("inputparams")
        .setCheck("inputparam");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("Inherited functions can be overridden to change their behaviour if they are marked as virtual in the parent contract. In this case, the function being overridden must use the override keyword (Is a modifier) in the function header. ");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#functions");
  }
};


Blockly.Blocks['return_clause'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("return");
    this.appendValueInput("values")
        .setCheck(["personalized_inputexpression","shift_expression","bitwise_expression","casting_expression","msgvariables","coin","tuple","txvariables","blockvariables","assing_value_expression1inputs","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now","type_text","block_null","time_expression","block_boolean","block_thisexpression","comparation_expression","comparation_arithmeticalexpression","arithmetical_expression","block_positivenumber","block_number","block_text","comparation_logicalexpression"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true,["clause","restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(15);
 this.setTooltip("This expression must be used to return a value. Must be the last expression contained in a function");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#return-variables");
  }
};

Blockly.Blocks['coin_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("coin")
        .appendField(new Blockly.FieldNumber(0), "amount_coin")
        .appendField(new Blockly.FieldDropdown([["ether","ether"], ["gwei","gwei"], ["pwei","pwei"], ["wei","wei"], ["szabo","szabo"], ["finney","finney"]]), "type_coin");
    this.setOutput(true, "coin_expression");
    this.setColour(230);
 this.setTooltip("This expressión represents a determined amount Ethereum unit currencies");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/units-and-global-variables.html#ether-units");
  }
};

Blockly.Blocks['visibility_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["view","view"], ["pure","pure"], ["payable","payable"]]), "visibility_values");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("View: To access a value (Example: get function, no modify anything). Pure: Transactions without access to or modification of a value (Example: Function returns 5+6 explicitly). Payable: Currency to be sent (Example: transfer(1)");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/cheatsheet.html#modifiers");
  }
};


Blockly.Blocks['block_usinglibrary'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("using")
        .appendField(new Blockly.FieldTextInput("Insert here library's name"), "name")
        .appendField("for")
        .appendField(new Blockly.FieldTextInput("alias"), "alias");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("This element represents the compiler order 'pragma solidity'. The compiler transform the smart contract code to bytecode for deploy in a blockchain network. You must insert this element expression in the file element");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/contracts.html#using-for");
  }
};

Blockly.Blocks['range_version'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("range_version")
        .appendField(new Blockly.FieldDropdown([[">","greater"], [">=","greater_equal"]]), "symbolversion")
        .appendField(new Blockly.FieldNumber(0, 0, 0), "value1version")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 9), "value2version")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 25), "value3version")
        .appendField(new Blockly.FieldDropdown([["<=","less_equal"], ["<","less"], [">","greater"], [">=","greater_equal"]]), "symbolcomparation")
        .appendField(new Blockly.FieldNumber(0, 0, 0), "value1versionoptional")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 9), "value2versionoptional")
        .appendField(".")
        .appendField(new Blockly.FieldNumber(0, 0, 25), "value3versionoptional");
    this.setOutput(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/layout-of-source-files.html#version-pragma");
  }
};

Blockly.Blocks['assign_value_expression'] = {
  init: function() {
    this.appendValueInput("value1_assignexpression")
        .setCheck(["personalized_inputexpression","bitwise_expression","shift_expression","casting_expression","msgvariables","coin","block_negation","txvariables","blockvariables","tuple","block_positivenumber","block_number","block_text","block_boolean","arithmetical_expression","parenthesis_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now","block_new","block_thisexpression","block_null"]);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["=","="], ["|=","|="], ["^=","^="], ["&=","&="], ["<<=","<<="], [">>=",">>="], ["+=","+="], ["-=","-="], ["*=","*="], ["/=","/="], ["%=","%="]]), "operators");
    this.appendValueInput("value2_assignexpression")
        .setCheck(["comparation_expression","comparation_arithmeticalexpression","comparation_logicalexpression","personalized_inputexpression","bitwise_expression","shift_expression","casting_expression","msgvariables","coin","block_negation","txvariables","blockvariables","tuple","block_positivenumber","block_number","block_text","block_boolean","arithmetical_expression","parenthesis_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now","block_new","block_thisexpression","block_null"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_new"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_new"]);
    this.setColour(230);
 this.setTooltip("Assign a value expression");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html#destructuring-assignments-and-returning-multiple-values");
  }
};



Blockly.Blocks['assing_value_expression1inputs'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["=","="], ["|=","|="], ["^=","^="], ["<<=","<<="], [">>=",">>="], ["+=","+="], ["-=","-="], ["*=","*="], ["/=","/="], ["%=","%="]]), "operators");
    this.appendValueInput("value1_assignexpression")
        .setCheck(["comparation_expression","comparation_arithmeticalexpression","comparation_logicalexpression","personalized_inputexpression","casting_expression","bitwise_expression","block_text","block_boolean","block_number","block_positivenumber","block_positivenumber","msgvariables","coin","txvariables","blockvariables","tuple","arithmetical_expression","parenthesis_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now","block_new","block_negation","block_thisexpression"]);
    this.setInputsInline(true);
    this.setOutput(true, "assing_value_expression1inputs");
    this.setColour(230);
 this.setTooltip("Assign a value for determined expression");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html#destructuring-assignments-and-returning-multiple-values");
  }
};


Blockly.Blocks['shift_expression'] = {
  init: function() {
    this.appendValueInput("value1_shiftexpression")
        .setCheck(["String","personalized_inputexpression"]);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["<<","<<"], [">>",">>"]]), "operators");
    this.appendValueInput("value2_shiftexpression")
        .setCheck(["String","personalized_inputexpression"]);
    this.setOutput(true, "shift_expression");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#shifts");
  }
};

Blockly.Blocks['shift_expression1inputs'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["<<","<<"], [">>",">>"]]), "operators");
    this.appendValueInput("value2_shiftexpression")
        .setCheck(["String","personalized_inputexpression"]);
    this.setInputsInline(true);
    this.setOutput(true, "shift_expression1inputs");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#shifts");
  }
};


Blockly.Blocks['bracket_expression'] = {
  init: function() {
    this.appendValueInput("identifier_bracketexpression")
        .setCheck("String")
        .appendField("identifier");
    this.appendDummyInput()
        .appendField("[");
    this.appendValueInput("index_bracketexpression")
        .setCheck(["msgvariables","personalized_inputexpression"]);
    this.appendDummyInput()
        .appendField("]");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['bitwise_expression'] = {
  init: function() {
    this.appendValueInput("value1_bitwiseexpression")
        .setCheck(["String", "personalized_inputexpression"]);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["|","|"], ["&","&"], ["^","^"], ["~","~"]]), "operators");
    this.appendValueInput("value2_bitwiseexpression")
        .setCheck(["String", "personalized_inputexpression"]);
    this.setOutput(true, "bitwise_expression");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['bitwise_expression1inputs'] = {
  init: function() {   
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["|","|"], ["&","&"], ["^","^"], ["~","~"]]), "operators");
    this.appendValueInput("value2_bitwiseexpression")
        .setCheck(["String", "personalized_inputexpression"]);
    this.setInputsInline(true);
    this.setOutput(true, "bitwise_expression1inputs");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['selfdestruct_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("selfdestruct")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['keccak_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("keccak256")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['sha_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["sha256","sha256"]]), "name")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['abyencode_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("abi.encodePacked")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['keccak_inputfunction'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("keccak256")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setOutput(true, "keccak_inputfunction");
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['sha_inputfunction'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["sha256","sha256"]]), "identifier")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setOutput(true, "sha_inputfunction");
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['abyencode_inputfunction'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("abi.encodePacked")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setOutput(true, "abyencode_inputfunction");
    this.setColour(345);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['coin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("coin")
        .appendField(new Blockly.FieldNumber(0, 0), "amount_coin")
        .appendField(new Blockly.FieldDropdown([["ether","ether_coin"], ["gwei","gwei_coin "], ["pwei","pwei_coin"], ["wei","wei_coin"], ["szabo","szabo_coin"], ["finney","finney_coin"]]), "type_coin");
    this.setOutput(true, "coin");
    this.setColour(230);
 this.setTooltip("Represents a unit currency.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['casting_expression'] = {
  init: function() {
    this.appendValueInput("type")
        .setCheck(["type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_text","block_payable","block_type_casting"])
        .appendField("type to cast");
    this.appendValueInput("expressioncast")
        .setCheck(null)//Para ceptar cualquier tipo de expresión por si caso
        .appendField("expression to cast");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("This expression represents a casting expression. Casting expression serves to change the type of a determined value");
 this.setHelpUrl("https://solang.readthedocs.io/en/latest/language/expressions.html#casting");
  }
};

Blockly.Blocks['block_payable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("payable");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("Change an address property to address payable property.Thus, the new address, which is of type address payable, can send currency");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/cheatsheet.html#modifiers");
  }
};

Blockly.Blocks['block_type_casting'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("This block represents a personalized type casting expression.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['personalized_struct'] = {
  init: function() {
    this.appendStatementInput("properties_struct")
        .setCheck(["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty"])
        .appendField("struct")
        .appendField(new Blockly.FieldTextInput("Insert here struct's identifier"), "name")
        .appendField("Properties");
    this.setInputsInline(false);
    this.setPreviousStatement(true,  ["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","modifier","event","clause","contract_constructor"]);
    this.setNextStatement(true,  ["block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","modifier","event","clause","contract_constructor"]);
    this.setColour(190);
 this.setTooltip("Define a personalized data type.  This data type personalised <u>may contain a number of different types of variables representing different properties of the data type</u>.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#structs");
  }
};

Blockly.Blocks['number_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([ ["uint", "uint"],["uint8", "uint8"],["uint16", "uint16"],["uint32", "uint32"],["uint64", "uint64"],["uint128", "uint128"],["uint256", "uint256"],["int", "int"],["int8", "int8"],["int16", "int16"],["int32", "int32"],["int64", "int64"],["int128", "int128"],["int256", "int256"]]), "numbertype_property");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendDummyInput()
      .appendField("visibility")
      .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
      .appendField("constant?")
      .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck(["Number", "personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here the name of the property"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","modifier","event","clause","contract_constructor"]);
    this.setColour(190);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['byte_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([["bytes","bytes"],["bytes1","bytes1"], ["bytes2","bytes2"], ["bytes3","bytes3"], ["bytes4","bytes4"], ["bytes5","bytes5"], ["bytes6","bytes6"], ["bytes7","bytes7"], ["bytes8","bytes8"], ["bytes9","bytes9"], ["bytes10","bytes10"], ["bytes12","bytes12"], ["bytes14","bytes14"], ["bytes16","bytes16"], ["bytes18","bytes18"], ["bytes20","bytes20"], ["bytes22","bytes22"], ["bytes24","bytes24"], ["bytes26","bytes26"], ["bytes28","bytes28"], ["bytes30","bytes30"], ["bytes32","bytes32"]]), "byte_type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here byte property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a byte variable. The user can determine the size of bytes to be held by the variable.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['identifier_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldTextInput("default"), "type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs","block_new"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here property's identifier"), "name")
        .appendField("value");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a personalized data type variable. The user must determinate the variable personalized type.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['user_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type User");
    this.appendValueInput("array_dimension")
        .setCheck(null)
        .appendField("array dimesion?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck("assing_value_expression1inputs")
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here user property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(190);
 this.setTooltip("This variable represents a personalized data type 'User' that interacts with the smart contract. If you want to use this variable, it requires you to define the custom data type 'User' (a struct data type), which is found in the 'Predefined data type' toolbar.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['company_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type Company");
    this.appendValueInput("array_dimension")
        .setCheck(null)
        .appendField("array dimesion?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck("assing_value_expression1inputs")
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here company property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(190);
 this.setTooltip("This variable represents a personalized data type 'Company' that interacts with the smart contract. If you want to use this variable, it requires you to define the custom data type 'Company' (a struct data type), which is found in the 'Predefined data type' toolbar.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['address_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([["address","address"], ["address payable","address payable"]]), "addresstype_values");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here the address property's identifier"), "name");
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("value");
    this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This variable represents an entity (smart contract, user, company) that interacts with the smart contract. Only address payable can send currencies. If you can convert an address variable to address payable, you must use a casting expression. Example: address payable(variable) or payable(variable)");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#address");
  }
};

Blockly.Blocks['mapping_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("mapping");
    this.appendValueInput("key")
        .setCheck(["type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_text"]);
    this.appendDummyInput()
        .appendField("=>");
    this.appendValueInput("value")
        .setCheck(["type_byte","type_uint","type_int","type_address","type_bool","type_identifier","type_text","type_User","type_Company"]);
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here mapping property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("The Key value in mapping property can be almost any type except for a mapping, a dynamically sized array, a contract, an enum and a struct");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#mapping-types");
  }
};

Blockly.Blocks['boolean_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type bool");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimesion?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck(["Boolean", "String","personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here boolean property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a bool variable. Bool variable represents two opposites values");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['text_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([["string","string_type"],["bytes[1]","bytes_type"]]), "type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimesion?");
    this.appendDummyInput()
        .appendField("visibility")
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility")
        .appendField("constant?")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "constant")
    this.appendValueInput("valueproperty")
        .setCheck(["String","personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here boolean property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a string variable. String is a text (Array of characters)");
 this.setHelpUrl("");
  }
};



Blockly.Blocks['enum'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("enum")
        .appendField(new Blockly.FieldTextInput("Insert here enum's identifier"), "name");
    this.appendStatementInput("values_enum")
        .setCheck(["enum_value"])
        .appendField("values");
    this.setInputsInline(true);
    this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
    this.setTooltip("Represents a personalized data type that contains personalized values");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#enums");
  }
};

Blockly.Blocks['enum_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("enum value")
        .appendField(new Blockly.FieldTextInput("Insert here the value"), "value_enum");
    this.setPreviousStatement(true, "enum_value");
    this.setNextStatement(true, "enum_value");
    this.setColour(190);
    this.setTooltip("You can define here the values of your enum type");
    this.setHelpUrl("");
  }
};


Blockly.Blocks['number_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([ ["uint", "uint"],["uint8", "uint8"],["uint16", "uint16"],["uint32", "uint32"],["uint64", "uint64"],["uint128", "uint128"],["uint256", "uint256"],["int", "int"],["int8", "int8"],["int16", "int16"],["int32", "int32"],["int64", "int64"],["int128", "int128"],["int256", "int256"]]), "numbertype_property");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here the name of the property"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a number variable");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['boolean_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type bool");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here boolean property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a bool variable. Bool variable represents two opposites values");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['text_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([["string","string_type"],["bytes[1]","bytes_type"]]), "type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["String","personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here Text property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a string variable. String is a text (Array of characters)");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['address_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([["address","address"], ["address payable","address payable"]]), "addresstype_values");
    this.appendValueInput("arraydimension")
        .setCheck("array_property")
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["msgvariables","personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here the address property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This variable represents an entity (smart contract, user, company) that interacts with the smart contract. Only address payable can send currencies. If you can convert an address variable to address payable, you must use a casting expression. Example: address payable(variable) or payable(variable)");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#address");
  }
};

Blockly.Blocks['identifier_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldTextInput("Insert here identifier type"), "type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here the property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause","block_ifcondition"]);
    this.setColour(190);
 this.setTooltip("This block represents a personalized data type variable. The user must determinate the variable personalized type.");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['byte_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type")
        .appendField(new Blockly.FieldDropdown([["bytes","bytes"],["bytes1","bytes1"], ["bytes2","bytes2"], ["bytes3","bytes3"], ["bytes4","bytes4"], ["bytes5","bytes5"], ["bytes6","bytes6"], ["bytes7","bytes7"], ["bytes8","bytes8"], ["bytes9","bytes9"], ["bytes10","bytes10"], ["bytes12","bytes12"], ["bytes14","bytes14"], ["bytes16","bytes16"], ["bytes18","bytes18"], ["bytes20","bytes20"], ["bytes22","bytes22"], ["bytes24","bytes24"], ["bytes26","bytes26"], ["bytes28","bytes28"], ["bytes30","bytes30"], ["bytes32","bytes32"]]), "byte_type");
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["String","personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here byte property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause"]);
    this.setColour(190);
 this.setTooltip("This block represents a byte variable. The user can determine the size of bytes to be held by the variable.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['mapping_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("mapping");
    this.appendValueInput("key")
        .setCheck(["type_address","type_bool","type_byte","type_identifier","type_int","type_uint","type_text"]);
    this.appendDummyInput()
        .appendField("=>");
    this.appendValueInput("value")
        .setCheck(["type_address","type_bool","type_byte","type_identifier","type_int","type_uint","type_text","type_User","type_Company"]);
    this.appendValueInput("arraydimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(["String","personalized_inputexpression","assing_value_expression1inputs"])
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here mapping property's identifier"), "name")
        .appendField("value");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause"]);
    this.setColour(190);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['user_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type User");
    this.appendValueInput("array_dimension")
        .setCheck(null)
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(null)
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here user property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(190);
 this.setTooltip("This block represents a personalized data type 'User' variable that interacts with the smart contract. If you want to use this variable, it requires you to define the custom data type 'User' (a struct data type), which is found in the 'Predefined data type' toolbar.");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['company_shortproperty'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("type Company");
    this.appendValueInput("array_dimension")
        .setCheck(null)
        .appendField("array dimension?");
    this.appendValueInput("valueproperty")
        .setCheck(null)
        .appendField("identifier")
        .appendField(new Blockly.FieldTextInput("Insert here company property's identifier"), "name")
        .appendField("value");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(190);
 this.setTooltip("This block represents a personalized data type 'Company' variable that interacts with the smart contract. If you want to use this variable, it requires you to define the custom data type 'Company' (a struct data type), which is found in the 'Predefined data type' toolbar.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['array_property'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("dimension")
        .appendField(new Blockly.FieldNumber(0, 0), "cells");
    this.appendValueInput("plus_dimension")
        .setCheck(['array_property',"dynamic_array"]);
    this.setInputsInline(true);
    this.setOutput(true, 'array_property');
    this.setColour(230);
 this.setTooltip("Represents a fixed dimension for array property");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['dynamic_array'] = {
  init: function() {
    this.appendValueInput("dimension")
        .setCheck(["dynamic_array","array_property"])
        .appendField("dynamic dimension");
    this.setInputsInline(false);
    this.setOutput(true, "dynamic_array");
    this.setColour(225);
 this.setTooltip("Represents a dynamic dimension for array property");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['visibility'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["public","public"], ["private","private"], ["none",""],["internal","internal"]]), "values_visibility");
    this.setOutput(true, 'visibility');
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['storagedata'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["memory","memory"], ["storage","storage"]]), "values_storagedata");
    this.setOutput(true, 'storagedata');
    this.setColour(230);
 this.setTooltip("Memory is a temporary storage location that is cleared after each function call, while storage is a persistent storage location that is maintained across function calls and even after the contract is terminated");
 this.setHelpUrl("https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html");
  }
};

Blockly.Blocks['inputmodifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["view","view"], ["pure","pure"], ["payable","payable"]]), "values_inputmodifier");
    this.setOutput(true, 'inputmodifier');
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['assert_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("assert")
        .appendField(new Blockly.FieldTextInput("Insert here expression"), "value_parameter");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("The assert function creates an error of type Panic(uint256). The same error is created by the compiler in certain situations as listed below.Assert should only be used to test for internal errors, and to check invariants. Assert requires a <b> bool expression </b>. Its similar to require expression.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html#panic-via-assert-and-error-via-require");
  }
};

Blockly.Blocks['block_unchecked'] = {
  init: function() {
    this.appendStatementInput("statements").setCheck([ "restriction_clause","restriction_clausecomment","emit_event", "personalized_expression","assign_value_expression","revert_expression", "deleteexpression","return_clause","block_ifcondition","block_whileloop","block_dowhile","block_for","block_unchecked"]) .appendField("unchecked");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Executes arithmetic operations without overflow and underflow checks.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['type_byte'] = {
  init: function() {
    var opcionesBytes = [["bytes", "bytes"]];
    for(var i = 1; i <= 32; i++){
      var tipoByte = "bytes" + i;
      opcionesBytes.push([tipoByte, tipoByte]);
    }
    this.appendDummyInput().appendField(new Blockly.FieldDropdown(opcionesBytes),"bytes_options");
    this.setOutput(true, "type_byte");
    this.setColour(230);
 this.setTooltip("Represents an array of bytes");
 this.setHelpUrl("https://docs.soliditylang.org/en/latest/types.html#bytes-and-string-as-arrays");
  }
};

Blockly.Blocks['type_uint'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["uint","uint"], ["uint2","uint2"], ["uint4","uint4"], ["uint6","uint6"], ["uint8","uint8"], ["uint10","uint10"], ["uint12","uint12"], ["uint18","uint18"], ["uint20","uint20"], ["uint24","uint24"], ["uint28","uint28"], ["uint32","uint32"], ["uint40","uint40"], ["uint48","uint48"], ["uint56","uint56"], ["uint64","uint64"], ["uint72","uint72"], ["uint80","uint80"], ["uint88","uint88"], ["uint96","uint96"], ["uint100","uint100"], ["uint106","uint106"], ["uint112","uint112"], ["uint120","uint120"], ["uint132","uint132"], ["uint156","uint156"], ["uint164","uint164"], ["uint180","uint180"], ["uint200","uint200"], ["uint220","uint220"], ["uint232","uint232"], ["uint256","uint256"]]), "uint_options");
    this.setOutput(true, "type_uint");
    this.setColour(230);
 this.setTooltip("Represents a positive number");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#integers");
  }
};

Blockly.Blocks['type_int'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["int","int"], ["int2","int2"], ["int4","int4"], ["int6","int6"], ["int8","int8"], ["int10","int10"], ["int12","int12"], ["int14","int14"], ["int20","int20"], ["int24","int24"], ["int28","int28"], ["int32","int32"], ["int40","int40"], ["int48","int48"], ["int56","int56"], ["int64","int64"], ["int72","int72"], ["int80","int80"], ["int88","int88"], ["int96","int96"], ["int100","int100"], ["int106","int106"], ["int112","int112"], ["int120","int120"], ["int124","int124"], ["int128","int128"], ["int132","int132"], ["int156","int156"], ["int164","int164"], ["int180","int180"], ["int186","int186"], ["int190","int190"], ["int200","int200"], ["int210","int210"], ["int214","int214"], ["int220","int220"], ["int224","int224"], ["int230","int230"], ["int232","int232"], ["int240","int240"], ["int246","int246"], ["int256","int256"]]), "int_options");
    this.setOutput(true, "type_int");
    this.setColour(230);
 this.setTooltip("Represents a number");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#integers");
  }
};

Blockly.Blocks['type_address'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["address","address"], ["address payable","address_payable"]]), "address_options");
    this.setOutput(true, "type_address");
    this.setColour(230);
 this.setTooltip("This data type represents a user, company or another smart contract that interacts with the smart contract");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#address");
  }
};

Blockly.Blocks['type_bool'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabelSerializable("bool"), "bool_options");
    this.setOutput(true, "type_bool");
    this.setColour(230);
 this.setTooltip("Represents two values opposite");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#booleans");
  }
};

Blockly.Blocks['type_User'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabelSerializable("user"), "user_options");
    this.setOutput(true, "type_User");
    this.setColour(230);
 this.setTooltip("Represents a predefined type User. If you define a User type property, you must define the User type by declaring in the smart contract the User struct with its associated information. This struct is already predefined in the tool.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['type_Company'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabelSerializable("company"), "company_options");
    this.setOutput(true, "type_User");
    this.setColour(230);
 this.setTooltip("Represents a predefined type Company. If you define a Company type property, you must define the Company type by declaring in the smart contract the Company struct with its associated information. This struct is already predefined in the tool.");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['type_identifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("Insert here your defined type"), "identifier_options");
    this.setOutput(true, "type_identifier");
    this.setColour(230);
 this.setTooltip("Represents a personalized data type");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['type_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("String");
    this.setInputsInline(true);
    this.setOutput(true, "type_text");
    this.setColour(230);
 this.setTooltip("Represents a String");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['type_mapping'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("mapping");
    this.appendValueInput("key")
        .setCheck(["type_text","type_int","type_uint","type_bool","type_byte","type_identifier","type_address"]);
    this.appendDummyInput()
        .appendField("=>");
    this.appendValueInput("value")
        .setCheck(["type_text","type_int","type_uint","type_bool","type_byte","type_identifier","type_User","type_Company","type_mapping"]);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("This data type represents a map key-value (Example: Dictionary, PhoneBook, etc.). You need associate a key to a value.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/types.html#mapping-types");
  }
};

Blockly.Blocks['block_struct'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("struct")
        .appendField(new Blockly.FieldTextInput("\"Indicate here the name\""), "name");
    this.appendStatementInput("struct_values")
        .setCheck(["personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"])
        .appendField("properties");
    this.setPreviousStatement(true, ["contract","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["contract","block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setColour(230);
 this.setTooltip("Defines a personalized data type. Inside it, you can define a simple properties.");
 this.setHelpUrl("https://solidity-by-example.org/structs/");
  }
};

Blockly.Blocks['block_user'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("struct User");
    this.appendStatementInput("user_values")
        .setCheck(null)
        .appendField("default properties");
    this.appendStatementInput("user_personalized_values")
    .setCheck( ["block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"])
    .appendField("Other user properties");
    this.setPreviousStatement(true, ["contract","block_struct","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause"]);
    this.setColour(180);
 this.setTooltip("This struct defines a custom data type in order to represent an actor that interacts with the smart contract. The predefined properties that it incorporates are the name, surname, address account and email, but more can be defined based on the needs of the programmer.");
 this.setHelpUrl("");
}
};



Blockly.Blocks['block_company'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("struct Company");
    this.appendStatementInput("company_values")
        .setCheck(null)
        .appendField("default company properties");
    this.appendStatementInput("company_personalized_values")
        .setCheck( ["block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"])
        .appendField("Other company properties");
    this.setPreviousStatement(true, ["contract","block_struct","block_user","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum"]);
    this.setNextStatement(true, ["block_user","block_struct","block_company","personalized_struct","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","enum","contract_constructor","modifier","event","clause"]);
    this.setColour(180);
 this.setTooltip("This struct defines a custom data type in order to represent a company that interacts with the smart contract. The predefined properties that it incorporates are the name, city, address account and email, but more can be defined based on the needs of the programmer.");
 this.setHelpUrl("");
}
};


Blockly.Blocks['deleteexpression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("delete")
        .appendField(new Blockly.FieldTextInput("Insert here the expression"), "value_deleteexpression");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['revert_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("revert")
        .appendField(new Blockly.FieldTextInput("Insert here the expression"), "value_revertexpression");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setColour(230);
    this.setTooltip("This expression terminates the execution of the code and reverts the current state of the smart contract back to the initial state before the execution of the code.");
    this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html#revert");   
  }  
};

Blockly.Blocks['block_assembly'] = {
  init: function() {
    this.appendStatementInput("assembly_values")
        .setCheck(['block_let_expression',"block_assignvalue_assemblyexpression"])
        .appendField("assembly");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.setColour(230);
 this.setTooltip("This expression is used to define low-level code expressions to be executed by the EVM. Inside this expression, you can define variables, aritmethical expression, etc.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/assembly.html");
  }
};

Blockly.Blocks['block_let_expression'] = {
  init: function() {
    this.appendValueInput("expression")
        .setCheck(['personalized_inputexpression'])
        .appendField("let")
        .appendField(new Blockly.FieldTextInput("name"), "name_var_let")
        .appendField(":=");
    this.setPreviousStatement(true, ['block_let_expression']);
    this.setNextStatement(true, ['block_let_expression']);
    this.setColour(230);
 this.setTooltip("This expression is used to declare a variable within the assembly expression");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_assignvalue_assemblyexpression'] = {
  init: function() {
    this.appendValueInput("expression")
        .setCheck(['personalized_inputexpression'])
        .appendField(new Blockly.FieldTextInput("name"), "name_var")
        .appendField(":=");
    this.setPreviousStatement(true,  ['block_let_expression']);
    this.setNextStatement(true,  ['block_let_expression']);
    this.setColour(230);
 this.setTooltip("This expression is used to represent a operational expression inside in the assembly expression");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['personalized_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("Insert here your personalized expression"), "values_expression");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setColour(230);
 this.setTooltip("Represents a personalized expression. You can define whatever you want");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['personalized_inputexpression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("Insert here your expression"), "values_expression");
    this.setOutput(true, "personalized_inputexpression");
    this.setColour(230);
 this.setTooltip("Represents a personalized expression. You can define whatever you want");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['tuple'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("tuple");
    this.appendStatementInput("values")
        .setCheck(["outputparam","personalized_expression"]);
    this.setInputsInline(true);
    this.setOutput(true, "tuple");
    this.setColour(230);
  }
};

Blockly.Blocks['block_ifcondition'] = {
  init: function() {
    this.appendValueInput("condition")
        .setCheck(["parenthesis_expression","comparation_logicalexpression","comparation_arithmeticalexpression","comparation_expression","parenthesis_expression","block_negation","personalized_inputexpression","block_boolean"])
        .appendField("if");
    this.appendStatementInput("actionsif")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_try"]);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setColour(230);
 this.setTooltip("Defines a condition that must be met in order to execute the logic/code inside its body.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html");
  }
};

Blockly.Blocks['block_elsecondition'] = {
  init: function() {
    this.appendStatementInput("actionselse")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_whileloop","block_dowhile","block_for","block_assembly"])
        .appendField("else");
    this.setPreviousStatement(true,["block_ifcondition","block_elseifcondition"]);
    this.setNextStatement(true,["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly","block_try"]);
    this.setColour(230);
 this.setTooltip("Executes the logic contained in the if the condition defined in the IF has not been met.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html");
  }
};

Blockly.Blocks['block_elseifcondition'] = {
  init: function() {
    this.appendValueInput("condition")
        .setCheck(["parenthesis_expression","comparation_logicalexpression","comparation_arithmeticalexpression","parenthesis_expression","comparation_expression"])
        .appendField("else if");
    this.appendStatementInput("actionselseif")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setPreviousStatement(true, ["block_ifcondition","block_elseifcondition"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly","block_try"]);
    this.setColour(230);
 this.setTooltip("Executes the collected logic if the condition defined in its block is met and if the condition defined in the previous IF is not met.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/control-structures.html");
  }
};


Blockly.Blocks['block_negation'] = {
  init: function() {
    this.appendValueInput("value")
        .setCheck(["parenthesis_expression","comparation_logicalexpression","comparation_arithmeticalexpression","parenthesis_expression","comparation_expression","block_null","block_boolean","personalized_inputexpression"])
        .appendField("!");
    this.setOutput(true, 'block_negation');
    this.setColour(0);
 this.setTooltip("Negation operator. Change to the opposite value comparation expression");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_new'] = {
  init: function() {
    this.appendValueInput("value")
        .setCheck("personalized_inputexpression")
        .appendField("new");
    this.setOutput(true, "block_new");
    this.setColour(90);
 this.setTooltip("This expression is used to create a new Object. Its equal to the Java expression new");
 this.setHelpUrl("");
  }
};

Blockly.Blocks["block_try"] = {
  init: function() {
    this.appendValueInput("expression")
    .setCheck(["personalized_inputexpression","casting_expression","block_new"]).appendField("try");
    this.appendValueInput("returns")
    .setCheck(["inputparam","outputparam","tuple"]).appendField("returns?");
    this.appendStatementInput("actions_try").setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, ["block_catch"]);
    this.setColour(210);
    this.setTooltip("Executes an external call and handles possible errors using catch blocks.");
    this.setHelpUrl("https://docs.soliditylang.org/en/latest/control-structures.html#try-catch");
  }
};

Blockly.Blocks["block_catch"] = {
  init: function() {
    this.appendDummyInput().appendField("catch").appendField(new Blockly.FieldDropdown([["generic","generic"],["Error","Error"],["Panic","Panic"],["bytes","bytes"]]), "catch_type");
    this.appendValueInput("parameter")
    .setCheck(["inputparam","inputparamshortidentifier"]).appendField("parameter?");
    this.appendStatementInput("actions_catch")
    .setCheck(null);
    this.setPreviousStatement(true, ["block_try","block_catch"]);
    this.setNextStatement(true, ["block_catch"]);
    this.setColour(210);
    this.setTooltip("Handles an error produced by the try block.");
    this.setHelpUrl("https://docs.soliditylang.org/en/latest/control-structures.html#try-catch");
  }
};

Blockly.Blocks['comparation_expression'] = {
  init: function() {
    this.appendValueInput("value1_expression")
        .setCheck(["block_boolean","coin","block_text","block_number","block_null","msgvariables","blockvariables","tuple","time_expression","coin_expression","block_positivenumber","block_negation","parenthesis_expression","personalized_inputexpression","arithmetical_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now","txvariables"]);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["==","=="], ["!=","!="]]), "operators");
    this.appendValueInput("value2_expression")
        .setCheck(["block_boolean","coin","block_text","block_number","block_null","msgvariables","blockvariables","tuple","time_expression","coin_expression","block_positivenumber","block_negation","parenthesis_expression","personalized_inputexpression","arithmetical_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now","txvariables"]);
    this.setInputsInline(true);
    this.setOutput(true, "comparation_expression");
    this.setColour(230);
 this.setTooltip("This blocks represents an expression to compare values");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['comparation_arithmeticalexpression'] = {
  init: function() {
    this.appendValueInput("value1_arithmeticalcomparationexpression","arithmetical_expression")
        .setCheck(["block_number","coin","block_positivenumber","time_expression","coin_expression","parenthesis_expression","msgvariables","blockvariables","personalized_inputexpression","arithmetical_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now"]);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["<","<"], ["<=","<="], [">",">"], [">=",">="]]), "operators");
    this.appendValueInput("value2_arithmeticalcomparationexpression")
        .setCheck(["block_number","coin","block_positivenumber","time_expression","coin_expression","parenthesis_expression","msgvariables","blockvariables","personalized_inputexpression","arithmetical_expression","keccak_inputfunction","sha_inputfunction","abyencode_function","block_now"]);
    this.setOutput(true, "comparation_arithmeticalexpression","arithmetical_expression");
    this.setColour(230);
 this.setTooltip("This blocks represents an expression to compare numeric values");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['comparation_logicalexpression'] = {
  init: function() {
    this.appendValueInput("value1_logicalexpression")
        .setCheck(["comparation_expression","comparation_arithmeticalexpression","block_negation","personalized_inputexpression","comparation_logicalexpression"]);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["&&","&&"], ["||","||"]]), "operators");
    this.appendValueInput("value2_logicalexpression")
        .setCheck(["comparation_expression","comparation_arithmeticalexpression","arithmetical_expression","block_negation","personalized_inputexpression","comparation_logicalexpression"]);
    this.setInputsInline(true);
    this.setOutput(true, "comparation_logicalexpression");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['blockvariables'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["block.difficulty","block.difficulty"], ["block.number","block.number"], ["block.timestamp","block.timestamp"], ["block.coinbase","block.coinbase"], ["block.gaslimit","block.gaslimit"], ["block.blockhash","block.blockhash"]]), "values_blockvariables");
    this.setOutput(true, "blockvariables");
    this.setColour(230);
 this.setTooltip("BLOCK.DIFFICULTY: Represents the actual difficulty to mined the transaction. BLOCK:NUMBER: Represents the current block. BLOCK:TIMESTAMP: The date when the block was created. BLOCK.COINBASE: Represents the address of the miner who mined the current block. BLOCK.GASLIMIT:  Represents the gas limit of the current block");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/units-and-global-variables.html#block-and-transaction-properties");
  }
};


Blockly.Blocks['msgvariables'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["msg.sender","msg.sender"], ["msg.value","msg.value"], ["msg.sender.balance","msg.sender.balance"], ["msg.gas","msg.gas"], ["msg.data","msg.data"], ["msg.sig","msg.sig"]]), "msgvariables");
    this.setOutput(true, "msgvariables");
    this.setColour(230);
 this.setTooltip("MSG.SENDER: The address value (Person, Entity, Company, Another Contract) interacting with the smart contract. MSG:VALUE:  Represents the amount of ether (in wei) sent along with the message or transaction. MSG.SENDER.BALANCE: Represents the address amount currencies available. MSG.GAS: Represents the amount of gas remaining for the current execution. MSG.DATA: Represents the calldata, or the data payload sent with the message or transaction.");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/units-and-global-variables.html#block-and-transaction-properties");
  }
};

Blockly.Blocks['txvariables'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["tx.origin","tx.origin"], ["tx.gasprice","tx.gasprice"]]), "values_txvariables");
    this.setOutput(true, "txvariables");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("https://docs.soliditylang.org/en/v0.8.25/units-and-global-variables.html#block-and-transaction-properties");
  }
};

Blockly.Blocks['block_this'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["this","this"], ["this.balance","this.balance"]]), "thisvalues");
    this.setOutput(true, "block_this");
    this.setColour(60);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_thisexpression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("this.")
        .appendField(new Blockly.FieldTextInput("default"), "value");
    this.setOutput(true, "block_thisexpression");
    this.setColour(60);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['time_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0, 0), "time_value")
        .appendField("time")
        .appendField(new Blockly.FieldDropdown([["years","years"], ["weeks","weeks"], ["days","days"], ["hours","hours"], ["minutes","minutes"], ["seconds","seconds"]]), "time_unity");
    this.setOutput(true, "time_expression");
    this.setColour(230);
 this.setTooltip("This block represents a time expression. You must define a number y select a time option to represent a time expression");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("\"")
        .appendField(new Blockly.FieldTextInput("default"), "value")
        .appendField("\"");
    this.setOutput(true, "block_text");
    this.setColour(230);
 this.setTooltip("Represents a string");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_boolean'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["true","true"], ["false","false"]]), "values");
    this.setOutput(true, "block_boolean");
    this.setColour(330);
 this.setTooltip("Represents two opposite values");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_number'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), "value");
    this.setOutput(true, "block_number");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_now'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("now");
    this.setOutput(true, "block_now");
    this.setColour(60);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_positivenumber'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("positive")
        .appendField(new Blockly.FieldNumber(0, 0), "value");
    this.setOutput(true, "block_positivenumber");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['arithmetical_expression'] = {
  init: function() {
    this.appendValueInput("value1_arithmeticalexpression")
        .setCheck(["arithmetical_expression","block_number","block_positivenumber","blockvariables","msgvariables","parenthesis_expression","personalized_inputexpression","block_now","time_expression","coin_expression"])
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["+","+"], ["-","-"], ["*","*"], ["/","/"], ["%","%"],["**","**"]]), "operators");
    this.appendValueInput("value2_arithmeticalexpression")
        .setCheck(["arithmetical_expression","block_number","block_positivenumber","blockvariables","msgvariables","parenthesis_expression","personalized_inputexpression","block_now","time_expression","coin_expression"]);
    this.setOutput(true, "arithmetical_expression");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['parenthesis_expression'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("(");
    this.appendValueInput("value")
        .setCheck(["block_negation","comparation_expression","comparation_logicalexpression","arithmetical_expression","comparation_arithmeticalexpression"]);
    this.appendDummyInput()
        .appendField(")");
    this.setOutput(true, "parenthesis_expression");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_for'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("for")
        .appendField(new Blockly.FieldTextInput("counter"), "namevariable")
        .appendField("=")
        .appendField(new Blockly.FieldNumber(0, 0), "value")
        .appendField(";")
        .appendField(new Blockly.FieldTextInput("counter"), "namevariable2")
        .appendField(new Blockly.FieldDropdown([["<","<"], ["<=","<="], [">",">"], [">=",">="]]), "operatorcomparation")
        .appendField(new Blockly.FieldTextInput("limit"), "limit")
        .appendField(";")
        .appendField(new Blockly.FieldTextInput("counter"), "namevariable3")
        .appendField(new Blockly.FieldDropdown([["++","++"], ["--","--"]]), "arithmeticaloperator");
    this.appendStatementInput("expressions_for")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly","block_try"]);
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setColour(330);
 this.setTooltip("This element represents Solidity for loop. The for loop is executed a number of times until the limit indicated by the loop counter is reached.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_whileloop'] = {
  init: function() {
    this.appendValueInput("condition")
        .setCheck(["block_negation","comparation_expression","comparation_arithmeticalexpression","comparation_logicalexpression","parenthesis_expression","personalized_inputexpression"])
        .appendField("while")
        .appendField("condition");
    this.appendStatementInput("elements_while")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
        this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
    "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setColour(330);
 this.setTooltip("This element represents Solidity while loop. This loop requires a logic expression to control the execution code.");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['block_dowhile'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("do");
    this.appendStatementInput("elements_dowhile")
        .setCheck(["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
        "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause",
        "block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for"]);
    this.appendValueInput("condition")
        .setCheck(["block_negation","comparation_expression","comparation_arithmeticalexpression","comparation_logicalexpression","parenthesis_expression","personalized_inputexpression","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
        "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"])
        .appendField("while condition");
    this.setPreviousStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_assembly"]);
    this.setNextStatement(true, ["restriction_clause","restriction_clausecomment","emit_event","personalized_expression","assign_value_expression","bracket_expression",
    "selfdestruct_function","keccak_function","sha_function","abyencode_function","assert_function","revert_expression","deleteexpression","return_clause","mapping_property","text_property","byte_property","identifier_property","boolean_property","address_property",
    "number_property","identifier_shortproperty","address_shortproperty","number_shortproperty","text_shortproperty","boolean_shortproperty","byte_shortproperty","mapping_shortproperty","block_ifcondition","block_elseifcondition","block_elsecondition","block_whileloop","block_dowhile","block_for","block_assembly"]);
    this.setColour(335);
 this.setTooltip("This element represents Solidity dowhile loop. This loop requires a logic expression to control the execution code.");
 this.setHelpUrl("");
  }
};
