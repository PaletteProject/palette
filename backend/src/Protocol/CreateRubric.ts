import {
    Rubric,
    RubricAssociation,
    RubricAssociationPurpose,
    RubricAssociationType,
    RubricCriterion
} from './RubricTypes';

/**
 * This type represents the request body for creating a new Rubric.
 *
 * https://canvas.instructure.com/doc/api/rubrics.html#method.rubrics.create
 */
export interface CreateRubricRequest {
    id: number;                     // The ID of the rubric
    rubric_association_id: number;  // The ID of the object associated with the rubric

    // The rubric object
    rubric: {
        title: string;                                // Title of the rubric
        free_form_criterion_comments: boolean;        // Whether free-form comments are allowed
        criteria: { [key: number]: RubricCriterion }; // An indexed hash of RubricCriteria objects
    };

    // The rubric_association object
    rubric_association: {
        association_id: number;                 // The ID of the object this rubric is associated with
        association_type: RubricAssociationType // Type of object
        use_for_grading: boolean;               // Whether rubric is used for grade calculation
        hide_score_total: boolean;              // Whether to hide the score total
        purpose: RubricAssociationPurpose       // Purpose of the association
    };
}

/**
 * This type represents the response body for creating a new Rubric.
 * It is a type alias for the RubricObjectHash interface.
 *
 * https://canvas.instructure.com/doc/api/rubrics.html#method.rubrics.create
 */
export interface CreateRubricResponse {
    rubric: Rubric;
    rubric_association: RubricAssociation;
}