/**
 * Competence Validation Handler
 * Handles real-time validation of competence values against their caracteristique limits
 */

export class CompetenceValidation {
    
    /**
     * Initialize competence validation for an actor sheet
     * @param {ActorSheet} sheet - The actor sheet instance
     */
    static initialize(sheet) {
        const html = sheet.element;
        
        // Add event listeners for competence inputs
        html.find('.competence-input').on('input change', function(event) {
            CompetenceValidation.validateCompetenceInput(event.target);
            CompetenceValidation.updateValidationSummary(html);
        });
                
        // Initial validation on sheet render
        html.find('.competence-input').each(function() {
            CompetenceValidation.validateCompetenceInput(this);
        });
        
        CompetenceValidation.updateValidationSummary(html);
    }
    
    /**
     * Validate a single competence input
     * @param {HTMLInputElement} input - The competence input element
     * @returns {boolean} - True if valid, false if invalid
     */
    static validateCompetenceInput(input) {
        const competenceValue = parseInt(input.value) || 0;
        const maxValue = parseInt(input.dataset.maxValue) || 0;
        const competenceKey = input.dataset.competenceKey;
        const baseScoreSpecialite = game.settings.get("ambre", "baseScoreSpecialite") || 10; // Get the setting
        const row = input.closest('.competence-row');
        const tooltip = input.parentElement.querySelector('.competence-validation-tooltip');
        const halfInput = row.querySelector('.competence-half');
        const totalDiv = row.querySelector('.competence-total');        
        const select = row.querySelector('.competence-select');
        
        // Remove all validation classes
        input.classList.remove('valid', 'at-max', 'error');
        row.classList.remove('valid', 'at-max', 'error');
        if (totalDiv) totalDiv.classList.remove('valid', 'at-max', 'error');
        
        // Hide tooltip
        if (tooltip) {
            tooltip.style.display = 'none';
        }
        
        // Calculate half value
        if (halfInput) {
            halfInput.value = Math.floor(competenceValue / 2);
        }
        
        // Calculate total (assuming total = caracteristique + competence)
        const caracteristiqueValue = maxValue;
        const totalValue = caracteristiqueValue + competenceValue;
        if (totalDiv) {
            totalDiv.textContent = totalValue;
        }
        
        // Determine visibility based on the core conditions
        const isVisibleConditionMet = (competenceValue >= baseScoreSpecialite);
        let shouldBeVisible = isVisibleConditionMet; // Simplified based on your last request

        // --- DEBUGGING START ---
        console.log(`Ambre | Validating Competence: ${competenceKey}`);
        console.log(`  - Competence Value (input.value): ${input.value} -> Parsed: ${competenceValue}`);
        console.log(`  - Base Score Specialite (setting): ${baseScoreSpecialite}`);
        console.log(`  - Condition (competenceValue >= baseScoreSpecialite): ${competenceValue} >= ${baseScoreSpecialite} -> ${isVisibleConditionMet}`);
        console.log(`  - Calculated shouldBeVisible: ${shouldBeVisible}`);
        // --- DEBUGGING END ---

        if (select) {
            select.style.visibility = shouldBeVisible ? 'visible' : 'hidden';
            if (shouldBeVisible) {
                select.disabled = false;
                select.classList.remove('disabled');
            } else {
                select.disabled = true;
                select.selectedIndex = 0; // Reset to "Aucune"
                select.classList.add('disabled');
            }
        }

        // Apply visual validation classes to input and row
        if (competenceValue > maxValue) {
            // ERROR: Competence > Caracteristique - HIGHLIGHT THE ROW
            input.classList.add('error');
            row.classList.add('error');
            if (totalDiv) totalDiv.classList.add('error');

            // Show tooltip with error message
            if (tooltip) {
                tooltip.style.display = 'block';
                tooltip.textContent = `Valeur max: ${maxValue} (Actuel: ${competenceValue})`;
                tooltip.className = 'competence-validation-tooltip error';
            }
            console.warn(`Competence "${competenceKey}" exceeds maximum: ${competenceValue} > ${maxValue}`);
            return false;
            
        } else if (competenceValue === maxValue && competenceValue > 0) {
            // AT MAX: Competence = Caracteristique
            input.classList.add('at-max');
            row.classList.add('at-max');
            if (totalDiv) totalDiv.classList.add('at-max');

            // Show info tooltip
            if (tooltip) {
                tooltip.style.display = 'block';
                tooltip.textContent = `Maximum atteint: ${maxValue}`;
                tooltip.className = 'competence-validation-tooltip warning';
            }
            return true;
            
        } else if (competenceValue > 0) {
            // VALID: 0 < Competence < Caracteristique (and not at max)
            input.classList.add('valid');
            row.classList.add('valid');
            if (totalDiv) totalDiv.classList.add('valid');

            // Hide tooltip for valid values
            if (tooltip) {
                tooltip.style.display = 'none';
            }
            return true;
            
        } else {
            // ZERO VALUE
            // No special styling for zero values, just disable specialites
            return true;
        }
    }
    /**
     * Update the validation summary section
     * @param {jQuery} html - The sheet HTML element
     */
    static updateValidationSummary(html) {
        const summaryDiv = html.find('#competences-validation')[0];
        if (!summaryDiv) return;
        
        const errorRows = html.find('.competence-row.error');
        const warningRows = html.find('.competence-row.at-max');
        const validRows = html.find('.competence-row.valid');
        
        summaryDiv.innerHTML = '';
        summaryDiv.className = 'competences-validation-summary';
        
        if (errorRows.length > 0) {
            summaryDiv.classList.add('has-errors');
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'validation-message error';
            errorMsg.innerHTML = `<strong>⚠ ${errorRows.length} compétence(s) dépassent leur maximum:</strong>`;
            summaryDiv.appendChild(errorMsg);
            
            const errorList = document.createElement('ul');
            errorList.className = 'validation-list error';
            
            errorRows.each(function() {
                const competenceName = this.querySelector('.competence-label').textContent;
                const competenceValue = this.querySelector('.competence-input').value;
                const maxValue = this.querySelector('.competence-input').dataset.maxValue;
                
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${competenceName}</strong>: ${competenceValue} > ${maxValue}`;
                errorList.appendChild(listItem);
            });
            
            summaryDiv.appendChild(errorList);
        }
        
        if (warningRows.length > 0) {
            const warningMsg = document.createElement('div');
            warningMsg.className = 'validation-message warning';
            warningMsg.innerHTML = `<strong>⚡ ${warningRows.length} compétence(s) au maximum:</strong>`;
            summaryDiv.appendChild(warningMsg);
            
            const warningList = document.createElement('ul');
            warningList.className = 'validation-list warning';
            
            warningRows.each(function() {
                const competenceName = this.querySelector('.competence-label').textContent;
                const maxValue = this.querySelector('.competence-input').dataset.maxValue;
                
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${competenceName}</strong>: ${maxValue}`;
                warningList.appendChild(listItem);
            });
            
            summaryDiv.appendChild(warningList);
        }
        
        if (errorRows.length === 0 && validRows.length > 0) {
            const successMsg = document.createElement('div');
            successMsg.className = 'validation-message success';
            successMsg.innerHTML = `<strong>✓ Toutes les compétences sont valides</strong>`;
            summaryDiv.appendChild(successMsg);
        }
        
        // Add statistics
        const statsDiv = document.createElement('div');
        statsDiv.className = 'validation-stats';
        const totalCompetences = html.find('.competence-row').length;
        const activeCompetences = html.find('.competence-input').filter(function() {
            return parseInt(this.value) > 0;
        }).length;
        
        statsDiv.innerHTML = `
            <small>
                <strong>Statistiques:</strong> 
                ${activeCompetences}/${totalCompetences} compétences actives | 
                ${errorRows.length} erreurs | 
                ${warningRows.length} au maximum
            </small>
        `;
        summaryDiv.appendChild(statsDiv);
    }
    
    /**
     * Validate all competences on a sheet
     * @param {jQuery} html - The sheet HTML element
     * @returns {boolean} - True if all competences are valid
     */
    static validateAllCompetences(html) {
        let allValid = true;
        
        html.find('.competence-input').each(function() {
            const isValid = CompetenceValidation.validateCompetenceInput(this);
            if (!isValid) {
                allValid = false;
            }
        });
        
        CompetenceValidation.updateValidationSummary(html);
        return allValid;
    }
    
    /**
     * Get validation statistics for a sheet
     * @param {jQuery} html - The sheet HTML element
     * @returns {Object} - Validation statistics
     */
    static getValidationStats(html) {
        const totalCompetences = html.find('.competence-row').length;
        const errorCount = html.find('.competence-row.error').length;
        const warningCount = html.find('.competence-row.at-max').length;
        const validCount = html.find('.competence-row.valid').length;
        const activeCount = html.find('.competence-input').filter(function() {
            return parseInt(this.value) > 0;
        }).length;
        
        return {
            total: totalCompetences,
            active: activeCount,
            valid: validCount,
            warnings: warningCount,
            errors: errorCount,
            isAllValid: errorCount === 0
        };
    }
    
    /**
     * Reset all competence validations
     * @param {jQuery} html - The sheet HTML element
     */
    static resetValidation(html) {
        // Remove all validation classes
        html.find('.competence-input, .competence-row, .competence-total')
            .removeClass('valid at-max error');
        
        // Hide all tooltips
        html.find('.competence-validation-tooltip').hide();
        
        // Clear validation summary
        const summaryDiv = html.find('#competences-validation')[0];
        if (summaryDiv) {
            summaryDiv.innerHTML = '';
            summaryDiv.className = 'competences-validation-summary';
        }
    }
    
    /**
     * Export validation results for debugging
     * @param {jQuery} html - The sheet HTML element
     * @returns {Array} - Array of validation results
     */
    static exportValidationResults(html) {
        const results = [];
        
        html.find('.competence-row').each(function() {
            const row = $(this);
            const competenceName = row.find('.competence-label').text();
            const competenceValue = parseInt(row.find('.competence-input').val()) || 0;
            const maxValue = parseInt(row.find('.competence-input').data('max-value')) || 0;
            const isValid = competenceValue <= maxValue;
            const isAtMax = competenceValue === maxValue && competenceValue > 0;
            const isError = competenceValue > maxValue;
            
            results.push({
                name: competenceName,
                value: competenceValue,
                maxValue: maxValue,
                isValid: isValid,
                isAtMax: isAtMax,
                isError: isError,
                status: isError ? 'error' : (isAtMax ? 'warning' : (competenceValue > 0 ? 'valid' : 'inactive'))
            });
        });
        
        return results;
    }
}

// Auto-initialize when DOM is ready
$(document).ready(function() {
    console.log('Competence Validation module loaded');
});